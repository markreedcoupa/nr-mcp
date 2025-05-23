import {
	defaultLogger,
	defaultContainer,
	type Constructor,
} from "../utils/index.js";
import {
	NewRelicLogsService,
	type LogsQueryResult,
	type LogsQueryOptions,
} from "../services/index.js";

/**
 * URI pattern for New Relic logs resources
 * Format: newrelic-logs://[traceId|requestId]/[value](/timeRange/[minutes])
 * Examples:
 * - newrelic-logs://trace/abc123
 * - newrelic-logs://trace/abc123/timeRange/30
 * - newrelic-logs://request/xyz789/timeRange/120
 */
const NEW_RELIC_LOGS_URI_PATTERN =
	/^newrelic-logs:\/\/(trace|request)\/([^\/]+)(?:\/timeRange\/(\d+))?$/;

/**
 * Parse a New Relic logs resource URI
 * @param uri The URI to parse
 * @returns The parsed URI components or null if the URI is invalid
 */
export function parseNewRelicLogsUri(
	uri: string,
): { type: "trace" | "request"; id: string; timeRange?: number } | null {
	const match = uri.match(NEW_RELIC_LOGS_URI_PATTERN);
	if (!match) {
		return null;
	}

	const [, type, id, timeRange] = match;
	return {
		type: type as "trace" | "request",
		id,
		timeRange: timeRange ? Number.parseInt(timeRange, 10) : undefined,
	};
}

/**
 * Get the list of available New Relic logs resources
 * This is a placeholder since we don't have a way to list all traces/requests
 * @returns The list of available resources
 */
export async function listNewRelicLogsResources() {
	return {
		resources: [],
		resourceTemplates: [
			{
				uriTemplate: "newrelic-logs://trace/{traceId}",
				name: "New Relic Logs by Trace ID",
				description:
					"Logs filtered by a specific New Relic trace ID (default: last 60 minutes)",
				mimeType: "application/json",
			},
			{
				uriTemplate: "newrelic-logs://trace/{traceId}/timeRange/{minutes}",
				name: "New Relic Logs by Trace ID with Time Range",
				description:
					"Logs filtered by a specific New Relic trace ID with custom time range in minutes",
				mimeType: "application/json",
			},
			{
				uriTemplate: "newrelic-logs://request/{requestId}",
				name: "New Relic Logs by Request ID",
				description:
					"Logs filtered by a specific request ID (default: last 60 minutes)",
				mimeType: "application/json",
			},
			{
				uriTemplate: "newrelic-logs://request/{requestId}/timeRange/{minutes}",
				name: "New Relic Logs by Request ID with Time Range",
				description:
					"Logs filtered by a specific request ID with custom time range in minutes",
				mimeType: "application/json",
			},
		],
	};
}

/**
 * Read New Relic logs resource content
 * @param uri The URI of the resource to read
 * @param options Additional options for reading the resource
 * @returns The resource content
 */
export async function readNewRelicLogsResource(
	uri: string,
	options?: {
		limit?: number;
		timeRange?: number;
		whereConditions?: string[];
		selectFields?: string[];
	},
) {
	try {
		defaultLogger.info(`Reading New Relic logs resource: ${uri}`);

		// Parse the URI
		const parsedUri = parseNewRelicLogsUri(uri);
		if (!parsedUri) {
			throw new Error(`Invalid New Relic logs resource URI: ${uri}`);
		}

		// Get the logs service from the container
		const logsService = defaultContainer.get(
			NewRelicLogsService as unknown as Constructor<NewRelicLogsService>,
		) as NewRelicLogsService;

		// Build query options
		const queryOptions: LogsQueryOptions = {
			limit: options?.limit || 100,
			// Prioritize timeRange from URI if available, then from options, then default to 60 minutes
			timeRange: parsedUri.timeRange || options?.timeRange || 60,
			whereConditions: options?.whereConditions || [],
			// Default to selecting timestamp, message, tag, userAgent if no fields specified
			selectFields: options?.selectFields || [
				"timestamp",
				"message",
				"tag",
				"userAgent",
			],
		};

		// Add traceId or requestId condition based on the URI
		if (parsedUri.type === "trace") {
			queryOptions.whereConditions?.push(`trace.id = '${parsedUri.id}'`);
		} else if (parsedUri.type === "request") {
			queryOptions.whereConditions?.push(`request_id = '${parsedUri.id}'`);
		}

		// Execute the query
		const result = await logsService.queryLogs(queryOptions);

		defaultLogger.info(
			`Retrieved ${result.logs.length} log entries for resource ${uri}`,
		);

		// Return the resource content
		return {
			contents: [
				{
					uri,
					mimeType: "application/json",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	} catch (error) {
		defaultLogger.error(
			`Failed to read New Relic logs resource: ${uri}`,
			error,
		);
		throw error;
	}
}
