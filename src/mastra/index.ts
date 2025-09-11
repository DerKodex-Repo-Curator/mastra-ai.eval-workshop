// @ts-nocheck
import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { ConsoleLogger } from "@mastra/core/logger";
import { newsAgent } from "./agents";
import { LangfuseExporter } from "@mastra/langfuse";

const storage = new LibSQLStore({
  url: "file:./mastra.db",
});

const langfuseExporter = new LangfuseExporter({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
  realtime: true,
});

export const mastra = new Mastra({
  logger: new ConsoleLogger(),
  storage,
  agents: {
    newsAgent,
  },
  observability: {
    default: { enabled: true },
    // Uncomment to use Langfuse
    // configs: {
    //   langfuse: {
    //     serviceName: 'langfuse-service',
    //     exporters: [langfuseExporter],
    //   },
    // },
  },
});
