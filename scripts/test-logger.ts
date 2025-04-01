import { logger, createTextLogger, createJsonLogger } from "../src/utils/logger.js";

// Default logger (JSON strategy)
console.log("Using default JSON logger:");
logger.info("This is an info message");
logger.error("This is an error message");
logger.debug("This is a debug message (only shown if DEBUG env var is set)");

console.log("\n-----------------------------------\n");

// Text logger with colorful output
console.log("Using text logger with chalk:");
const textLogger = createTextLogger();
textLogger.info("This is an info message");
textLogger.error("This is an error message");
textLogger.debug("This is a debug message (only shown if DEBUG env var is set)");

console.log("\n-----------------------------------\n");

// Switch back to JSON logger
console.log("Switching back to JSON logger:");
const jsonLogger = createJsonLogger();
jsonLogger.info("This is an info message");
jsonLogger.error("This is an error message");
jsonLogger.debug("This is a debug message (only shown if DEBUG env var is set)");