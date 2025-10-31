import { logger } from "@/lib";
import type { Response } from "express";
import type { Error as MongooseError } from "mongoose";
import { isValidObjectId } from "mongoose";
import { sendBadRequest, sendInternalError } from "./response-handler";

/**
 * Handle MongoDB errors and send appropriate response
 * @param error - Error object from MongoDB/Mongoose
 * @param res - Express response object
 * @param defaultMessage - Default error message if error type is unknown
 * @returns Response object
 */
export const exceptionErrorHandler = (
	error: unknown,
	res: Response,
	defaultMessage = "Database operation failed",
) => {
	console.error("MongoDB Error:", error);
	logger.error("MongoDB Error:", error);

	if (error && typeof error === "object" && "name" in error) {
		const mongoError = error as MongooseError;

		// Handle CastError (invalid ObjectId format)
		if (mongoError.name === "CastError") {
			return sendBadRequest(
				res,
				"Invalid ID format provided. Please check your input",
			);
		}

		// Handle ValidationError
		if (mongoError.name === "ValidationError") {
			const validationError = mongoError as any;
			const errors = Object.values(validationError.errors || {}).map(
				(err: any) => ({
					path: err.path || "unknown",
					message: err.message || "Validation failed",
				}),
			);

			return sendBadRequest(res, "Validation failed", errors);
		}

		// Handle Duplicate Key Error (E11000)
		if ("code" in mongoError && (mongoError as any).code === 11000) {
			const duplicateError = mongoError as any;
			const field = Object.keys(duplicateError.keyPattern || {})[0] || "field";
			return sendBadRequest(
				res,
				`Duplicate value for ${field}. This ${field} already exists`,
			);
		}
	}

	// Default internal server error
	return sendInternalError(res, defaultMessage);
};

/**
 * Validate multiple ObjectIds
 * @param ids - Array of IDs to validate
 * @returns Object with isValid boolean and invalid IDs array
 */
export const validateObjectIds = (
	ids: string[],
): { isValid: boolean; invalidIds: string[] } => {
	const invalidIds = ids.filter((id) => !isValidObjectId(id));
	return {
		isValid: invalidIds.length === 0,
		invalidIds,
	};
};
