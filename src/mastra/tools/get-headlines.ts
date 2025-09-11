import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as NewsAPIModule from "ts-newsapi";
import dotenv from "dotenv";
import { countryCodes } from "./constants";
dotenv.config();

// Temporary fix for bundling and running tests
const NewsAPI =
  (NewsAPIModule as any).default.default ?? (NewsAPIModule as any).default;

if (!process.env.NEWS_API_KEY) {
  throw new Error(
    "NEWS_API_KEY is not set, please get a free api key from https://newsapi.org/ and set it in the .env file"
  );
}

const newsAPI = new NewsAPI(process.env.NEWS_API_KEY);

export const getTopHeadlines = createTool({
  id: "get-top-headlines",
  description: "Get the top headlines from the news",
  inputSchema: z.object({
    q: z.string().optional().describe("Keywords or a phrase to search for."),
    country: z
      // @ts-ignore - countryCodes have the correct values
      .enum(countryCodes)
      .default("us")
      .describe("The country to search in"),
    category: z
      .enum([
        "business",
        "entertainment",
        "general",
        "health",
        "science",
        "sports",
        "technology",
      ])
      .optional()
      .describe("The category to search in"),
    page: z.number().describe("The page number to return (starts at 1)"),
  }),
  execute: async ({ context }) => {
    const topHeadlines = await newsAPI.getTopHeadlines({
      q: context.q,
      country: context.country,
      category: context.category,
      pageSize: 3,
      page: context.page,
    });

    return topHeadlines.articles.map((article: any) => {
      return {
        source: article.source.name,
        title: article.title,
        url: article.url,
        headline: article.content,
      };
    });
  },
});

