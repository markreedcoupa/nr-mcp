#!/usr/bin/env node
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  try {
    console.log("Starting MCP server test...");
    
    // Create a transport that spawns our server
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
    });
    
    // Create a client
    const client = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    // Connect to the server
    console.log("Connecting to MCP server...");
    await client.connect(transport);
    
    // List available tools
    console.log("Listing available tools...");
    const tools = await client.listTools();
    console.log("Available tools:", tools);
    
    // Call the hello-world tool
    console.log("Calling hello-world tool...");
    const result = await client.callTool({
      name: "hello-world",
      arguments: {
        name: "Tester",
      },
    });
    
    console.log("Tool result:", result);
    
    // Close the connection
    await client.close();
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});