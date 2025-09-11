import { createTool } from "@mastra/core";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import z from "zod";

async function fetchContent(
  url: string,
  timeout = 15000
): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      throw new Error("Could not extract content");
    }

    return article.textContent;
  } catch (error) {
    console.error(`Failed to fetch ${url}`, error);
  }
}

export const fetchArticle = createTool({
  id: "fetch-article",
  description: "Fetch the article from the url",
  inputSchema: z.object({
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const content = await fetchContent(context.url);
    return { content };
  },
});
