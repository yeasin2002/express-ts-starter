import { logger } from "@/lib";
import type { Response } from "express";
import { DatabaseError } from "pg";
import { sendBadRequest, sendInternalError } from "./response-handler";

/**
 * Handle PostgreSQL and Drizzle ORM errors and send appropriate HTTP responses
 * @param error - Error object from Database or Drizzle
 * @param res - Express response object
 * @param defaultMessage - Fallback message for unhandled errors
 * @returns Response object
 */
export const dbErrorHandler = (
	error: unknown,
	res: Response,
	defaultMessage = "Database operation failed",
) => {
	console.error("Database Error:", error);
	logger.error("Database Error:", error);

	// Extract original PG error if wrapped in Drizzle error
	const pgError = (error as any)?.cause ?? error;

	if (pgError && (pgError instanceof DatabaseError || "code" in pgError)) {
		const code = pgError.code;

		// 23505: Unique violation
		if (code === "23505") {
			const detail = pgError.detail || "";
			const match = detail.match(/Key \((.*?)\)=/);
			const field = match ? match[1] : "Field";
			return sendBadRequest(
				res,
				`Duplicate entry for ${field}. A record with this ${field} already exists`,
				[{ path: field, message: `This ${field} is already in use` }],
			);
		}

		// 23503: Foreign key violation
		if (code === "23503") {
			const detail = pgError.detail || "";
			return sendBadRequest(
				res,
				`Foreign key violation: ${detail || "The referenced entity does not exist"}`,
			);
		}

		// 23502: Not null violation
		if (code === "23502") {
			const column = pgError.column || "field";
			return sendBadRequest(res, `Missing required field: ${column}`, [
				{ path: column, message: `${column} cannot be null` },
			]);
		}

		// 23514: Check constraint violation
		if (code === "23514") {
			return sendBadRequest(
				res,
				`Check constraint violation: ${pgError.constraint || "Validation condition failed"}`,
			);
		}

		// 22P02: Invalid text representation (e.g. invalid UUID format or number)
		if (code === "22P02") {
			return sendBadRequest(
				res,
				"Invalid input format provided (e.g. malformed UUID or numeric value)",
			);
		}

		// 22001: String data right truncation (value too long)
		if (code === "22001") {
			return sendBadRequest(
				res,
				"Input value exceeds the maximum allowed length",
			);
		}
	}

	// Default internal server error
	return sendInternalError(res, defaultMessage);
};

/**
 * Validate UUID format
 * @param id - UUID string to validate
 */
export const isValidUUID = (id: string): boolean => {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
};
