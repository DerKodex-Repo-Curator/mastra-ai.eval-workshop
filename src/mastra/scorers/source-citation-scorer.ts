import { createScorer } from "@mastra/core/scores";
import type {
  ScorerRunInputForAgent,
  ScorerRunOutputForAgent,
} from "@mastra/core/scores";

// Score based on whether the assistant message includes a citation to the source
// as instructed in the system prompt
export const sourceCitationScorer = createScorer<
  ScorerRunInputForAgent,
  ScorerRunOutputForAgent
>({
  name: "Source Citation",
  description:
    "Evaluates whether the response includes a citation to the source",
})
  .preprocess(({ run }) => {
    const sources = extractSourcesFromToolData(run.output);
    const assistantMessage = getAssistantMessageFromRunOutput(run.output);

    return {
      sources,
      assistantMessage,
    };
  })
  .generateScore(({ results }) => {
    const { sources, assistantMessage } = results.preprocessStepResult;

    if (sources.length === 0) {
      return 1;
    }

    for (const source of sources) {
      if (!assistantMessage?.includes(source)) {
        return 0;
      }
    }

    return 1;
  });

const extractSourcesFromToolData = (output: ScorerRunOutputForAgent) => {
  const sources: string[] = [];

  for (const message of output) {
    for (const part of message.parts) {
      if (
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation?.toolName === "getTopHeadlines"
      ) {
        part.toolInvocation.result?.forEach?.((data: any) =>
          sources.push(data.source.toLocaleLowerCase())
        );
      }
    }
  }

  return sources;
};

export const getAssistantMessageFromRunOutput = (
  output?: ScorerRunOutputForAgent
) => {
  return output
    ?.find(({ role }) => role === "assistant")
    ?.content?.toLocaleLowerCase();
};
