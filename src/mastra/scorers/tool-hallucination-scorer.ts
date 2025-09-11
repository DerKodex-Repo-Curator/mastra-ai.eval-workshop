// @ts-nocheck
import { openai } from "@ai-sdk/openai";
import {
  createScorer,
  ScorerRunInputForAgent,
  ScorerRunOutputForAgent,
} from "@mastra/core/scores";
import { z } from "zod";
import { getAssistantMessageFromRunOutput } from "./source-citation-scorer";

// Score based on whether the assistant message includes any information not supported by or contradicting the provided context(tool results)
export const toolHallucinationScorer = createScorer<
  ScorerRunInputForAgent,
  ScorerRunOutputForAgent
>({
  name: "Tool Hallucination Scorer",
  description:
    "A scorer that evaluates the hallucination of an LLM output to an input",
  // Default judge
  judge: {
    model: openai("gpt-4o"),
    instructions: `
You are a tool hallucination scorer.
You will be given the agent's response and you will need to verify if the statements contain any information not supported by or contradicting the provided context.`,
  },
})
  .preprocess({
    description: "Extract all statements from the given output",
    createPrompt: ({ run }) => {
      const agentResponse = getAssistantMessageFromRunOutput(run.output);
      return `
        Given the agent's response, extract all statements from the given output
        ${agentResponse}

        return the statements in JSON format.
        {
            "statements": [
                { "statement": "claim 1" },
                { "statement": "claim 2" },
                { "statement": "claim 3" },
            ]
        }`;
    },
    outputSchema: z.object({
      statements: z.array(z.object({ statement: z.string() })),
    }),
  })
  .analyze({
    description:
      "Verify if the statements contain any information not supported by or contradicting the provided context",
    judge: {
      model: openai("gpt-4o"),
      instructions: `
You are a tool hallucination scorer.
You will be given the agent's response and you will need to verify if the statements contain any information not supported by or contradicting the provided context.`,
    },
    outputSchema: z.object({
      verdicts: z.array(
        z.object({
          statement: z.string(),
          verdict: z.string(),
          reason: z.string(),
        })
      ),
    }),
    createPrompt: ({ results, run }) => {
      const context = extractToolResults(run.output);

      return `
        Verify if the statements contain any information not supported by or is contradicting the provided context, return YES if they do, NO if they don't.
        
        statements:
        ${JSON.stringify(results.preprocessStepResult.statements, null, 2)}

        Context:
        ${JSON.stringify(context, null, 2)}

        return the verdicts in JSON format.
        {
            "verdicts": [
                { "statement": "claim 1", "verdict": "YES", reason: "reason for the verdict" },
                { "statement": "claim 2", "verdict": "YES", reason: "reason for the verdict" },
                { "statement": "claim 3", "verdict": "NO", reason: "reason for the verdict" }
            ]
        }`;
    },
  })
  .generateScore(({ results }) => {
    return (
      results.analyzeStepResult.verdicts.filter((v) => v.verdict === "YES")
        .length / results.analyzeStepResult.verdicts.length
    );
  })
  .generateReason({
    description: "Generate a reason for the score",
    createPrompt: ({ results, score }) => {
      return `Generate a reason for the score ${score}, explain the score based on the verdicts in 1-2 sentences.

Verdicts:
${JSON.stringify(results.analyzeStepResult.verdicts, null, 2)}`;
    },
  });

const extractToolResults = (output: ScorerRunOutputForAgent) => {
  const toolResults = [];

  for (const message of output) {
    for (const part of message.parts) {
      if (
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result"
      ) {
        toolResults.push(part.toolInvocation.result);
      }
    }
  }
  return toolResults;
};
