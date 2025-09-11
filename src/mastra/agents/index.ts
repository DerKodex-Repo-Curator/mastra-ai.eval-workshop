// @ts-nocheck
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
import { getTopHeadlines, fetchArticle } from "../tools";
import { sourceCitationScorer } from "../scorers/source-citation-scorer";
import { toolHallucinationScorer } from "../scorers/tool-hallucination-scorer";
import { createAnswerRelevancyScorer } from "@mastra/evals/scorers/llm";

export const newsAgent = new Agent({
  name: "newsAgent",
  instructions: `You are a news agent that can answer questions about the news.
  
  You have access to the following tools:
  
  - getTopHeadlines: Get the top headlines from the news
  - fetchArticle: Fetch the article from the url
  
  Use the getTopHeadlines tool to get the top headlines from the news.
  Use the fetchArticle tool to fetch the article from the url.

  Make sure to always cite your sources when using the getTopHeadlines tool.
  `,
  model: openai("gpt-4o"),
  memory: new Memory(),
  tools: {
    getTopHeadlines,
    fetchArticle,
  },
  scorers: {
    sourceCitation: {
      scorer: sourceCitationScorer,
    },
    toolHallucination: {
      scorer: toolHallucinationScorer,
    },
    answerRelevancy: {
      scorer: createAnswerRelevancyScorer({ model: openai("gpt-4o") }),
      sampling: {
        type: "ratio",
        rate: 0.1,
      },
    },
  },
});
