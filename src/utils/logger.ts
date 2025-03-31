/**
 * Simple logger utility for the MCP server
 */
export class Logger {
	private static instance: Logger;

	private constructor() {}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	public info(message: string, ...args: unknown[]): void {
		console.log(`[INFO] ${message}`, ...args);
	}

	public error(message: string, ...args: unknown[]): void {
		console.error(`[ERROR] ${message}`, ...args);
	}

	public debug(message: string, ...args: unknown[]): void {
		if (process.env.DEBUG) {
			console.debug(`[DEBUG] ${message}`, ...args);
		}
	}
}

export const logger = Logger.getInstance();
