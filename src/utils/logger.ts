/**
 * Simple logger utility for the MCP server
 */
import chalk from 'chalk';

/**
 * Log level enum
 */
export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  DEBUG = 'debug',
}

/**
 * Logger strategy interface
 */
export interface LoggerStrategy {
  log(level: LogLevel, message: string, ...args: unknown[]): void;
}

/**
 * Text logger strategy that uses chalk for colorful output
 */
export class TextLoggerStrategy implements LoggerStrategy {
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case LogLevel.INFO:
        console.log(`${chalk.gray(timestamp)} ${chalk.blue('[INFO]')} ${message}`, ...args);
        break;
      case LogLevel.ERROR:
        console.error(`${chalk.gray(timestamp)} ${chalk.red('[ERROR]')} ${chalk.red(message)}`, ...args);
        break;
      case LogLevel.DEBUG:
        if (process.env.DEBUG) {
          console.debug(`${chalk.gray(timestamp)} ${chalk.yellow('[DEBUG]')} ${chalk.cyan(message)}`, ...args);
        }
        break;
    }
  }
}

/**
 * JSON logger strategy that outputs logs in JSON format
 */
export class JsonLoggerStrategy implements LoggerStrategy {
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      args: args.length > 0 ? args : undefined,
    };
    
    switch (level) {
      case LogLevel.INFO:
        console.log(JSON.stringify(logObject));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(logObject));
        break;
      case LogLevel.DEBUG:
        if (process.env.DEBUG) {
          console.debug(JSON.stringify(logObject));
        }
        break;
    }
  }
}

export class Logger {
  private static instance: Logger;
  private strategy: LoggerStrategy;

  private constructor(strategy: LoggerStrategy = new JsonLoggerStrategy()) {
    this.strategy = strategy;
  }

  public static getInstance(strategy?: LoggerStrategy): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(strategy);
    } else if (strategy) {
      Logger.instance.setStrategy(strategy);
    }
    return Logger.instance;
  }

  /**
   * Set the logger strategy
   * @param strategy The logger strategy to use
   */
  public setStrategy(strategy: LoggerStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get the current logger strategy
   * @returns The current logger strategy
   */
  public getStrategy(): LoggerStrategy {
    return this.strategy;
  }

  public info(message: string, ...args: unknown[]): void {
    this.strategy.log(LogLevel.INFO, message, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    this.strategy.log(LogLevel.ERROR, message, ...args);
  }

  public debug(message: string, ...args: unknown[]): void {
    this.strategy.log(LogLevel.DEBUG, message, ...args);
  }
}

// Create and export the default logger instance with JSON strategy (default)
export const logger = Logger.getInstance();

/**
 * Create a logger with text strategy
 * @returns A logger instance with text strategy
 */
export function createTextLogger(): Logger {
  return Logger.getInstance(new TextLoggerStrategy());
}

/**
 * Create a logger with JSON strategy
 * @returns A logger instance with JSON strategy
 */
export function createJsonLogger(): Logger {
  return Logger.getInstance(new JsonLoggerStrategy());
}
