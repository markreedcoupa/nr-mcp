import { z } from "zod";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../utils/logger.js";

/**
 * Schema for the hello world tool parameters
 */
export const HelloWorldSchema = {
  name: z.string().optional().describe("Name to greet"),
};

/**
 * Hello world tool implementation
 * @param args Tool arguments
 * @returns Tool result
 */
export const helloWorldTool: ToolCallback<typeof HelloWorldSchema> = async (args) => {
  const name = args.name || "World";
  logger.info(`Hello world tool called with name: ${name}`);
  
  return {
    content: [
      {
        type: "text",
        text: `Hello, ${name}! This is a greeting from the MCP server.`,
      },
    ],
  };
};