import { McpServer as MCP } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import type { TransportAdapter } from "../transports/transport-adapter.js";
import { createTransportAdapter } from "../transports/transport-adapter.js";
import { logger } from "./logger.js";
import { HelloWorldSchema, helloWorldTool } from "../tools/hello-world.js";

/**
 * Configuration options for the MCP server
 */
export interface McpServerConfig {
  /**
   * Name of the server
   */
  name: string;
  
  /**
   * Version of the server
   */
  version: string;
  
  /**
   * Transport type to use
   */
  transportType: "stdio" | "sse";
  
  /**
   * Additional server options
   */
  options?: ServerOptions;
}

/**
 * McpServer class that wraps the Server from the MCP SDK with a transport adapter
 */
export class McpServer {
  private mcpServer: MCP;
  private transportAdapter: TransportAdapter;
  private transport: Transport | null = null;
  
  /**
   * Creates a new McpServer instance
   * @param config Server configuration
   */
  constructor(private config: McpServerConfig) {
    logger.info(`Initializing MCP server: ${config.name} v${config.version}`);
    
    // Create the MCP server
    this.mcpServer = new MCP(
      {
        name: config.name,
        version: config.version,
      
      },
      config.options
    );
    
    // Create the transport adapter
    this.transportAdapter = createTransportAdapter(config.transportType);
    
    // Register tools
    this.registerTools();
  }
  
  /**
   * Registers all tools with the MCP server
   */
  private registerTools(): void {
    logger.info("Registering tools");
    
    // Register the hello world tool
    this.mcpServer.tool(
      "hello-world",
      "A simple hello world tool that returns a greeting",
      HelloWorldSchema,
      helloWorldTool
    );
  }
  
  /**
   * Starts the MCP server
   */
  async start(): Promise<void> {
    logger.info("Starting MCP server");
    
    try {
      // Create the transport
      this.transport = await this.transportAdapter.createTransport();
      
      // Connect the MCP server to the transport
      await this.mcpServer.connect(this.transport);
      
      logger.info("MCP server started successfully");
    } catch (error) {
      logger.error("Failed to start MCP server", error);
      throw error;
    }
  }
  
  /**
   * Stops the MCP server
   */
  async stop(): Promise<void> {
    logger.info("Stopping MCP server");
    
    try {
      if (this.transport) {
        await this.mcpServer.close();
        this.transport = null;
      }
      
      logger.info("MCP server stopped successfully");
    } catch (error) {
      logger.error("Failed to stop MCP server", error);
      throw error;
    }
  }
  
  /**
   * Gets the underlying MCP server instance
   * @returns The MCP server instance
   */
  getMcpServer(): MCP {
    return this.mcpServer;
  }
}