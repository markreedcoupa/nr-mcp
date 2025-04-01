#!/usr/bin/env node
import { McpServer } from "./utils/server.js";
import { logger } from "./utils/logger.js";

async function main() {
  try {
    // Create and start the MCP server
    const server = new McpServer({
      name: "newrelic-mcp-server",
      version: "1.0.0",
      transportType: "stdio",
    });
    
    // Handle process termination signals
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT signal, shutting down...");
      await server.stop();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM signal, shutting down...");
      await server.stop();
      process.exit(0);
    });
    
    // Start the server
    await server.start();
    
    logger.info("MCP server is running. Press Ctrl+C to stop.");
  } catch (error) {
    logger.error("Failed to start MCP server", error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  logger.error("Unhandled error", error);
  process.exit(1);
});