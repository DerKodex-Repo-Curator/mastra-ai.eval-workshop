import { runExperiment } from "@mastra/core/scores";
import { newsAgent } from ".";
import { sourceCitationScorer } from "../scorers/source-citation-scorer";
import { it, describe, expect, beforeAll } from "vitest";
import dotenv from "dotenv";
dotenv.config();

const data = [
  { input: "what are the top headlines in tech" },
  { input: "tell me about the latest news in health" },
  { input: "what is happening in sports today" },
];

describe("source citation scorer", () => {
  it("should cite the source when asking headlines", async () => {
    const result = await runExperiment({
      data,
      target: newsAgent,
      scorers: [sourceCitationScorer],
    });

    // Assert the average of the source citation scorer is 1
    expect(result.scores.sourceCitation).toBe(1);
  });
}, 60000);

describe("source citation scorer", () => {
  it("should cite the source when asking headlines", async () => {
    const results: Record<string, any>[] = [];

    await runExperiment({
      data,
      target: newsAgent,
      scorers: [sourceCitationScorer],
      onItemComplete: ({ item, scorerResults }) => {
        results.push({ item, scorerResults });
      },
    });

    // Assert each result has a score of 1
    results.forEach(({ item, scorerResults }) => {
      expect(
        scorerResults["Source Citation"].score,
        `for ${item.input}`
      ).toEqual(1);
    });
  }, 60000);
});
