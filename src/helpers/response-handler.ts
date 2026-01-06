import { logger } from "@/lib";
import type { Response } from "express";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
	status: number;
	message: string;
	data: T | null;
	success: boolean;
	errors?: Array<{
		path: string;
		message: string;
	}>;
}

/**
 * Send success response
 * @param res - Express response object
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Success message
 * @param data - Response data (optional)
 */
export function sendSuccess<T = any>(
	res: Response,
	statusCode: number = 200,
	message: string,
	data: T | null = null,
): Response<ApiResponse<T>> {
	return res.status(statusCode).json({
		status: statusCode,
		message,
		data,
		success: true,
	});
}

/**
 * Send error response
 * @param res - Express response object
 * @param statusCode - HTTP status code (default: 500)
 * @param message - Error message
 * @param errors - Validation errors (optional)
 */
export function sendError(
	res: Response,
	statusCode: number = 500,
	message: string,
	errors?: Array<{ path: string; message: string }>,
): Response<ApiResponse<null>> {
	logger.error("500 Error: ", message);
	const response: ApiResponse<null> = {
		status: statusCode,
		message,
		data: null,
		success: false,
	};

	if (errors && errors.length > 0) {
		response.errors = errors;
	}

	return res.status(statusCode).json(response);
}

/**
 * Send created response (201)
 * @param res - Express response object
 * @param message - Success message
 * @param data - Created resource data
 */
export function sendCreated<T = any>(
	res: Response,
	message: string,
	data: T,
): Response<ApiResponse<T>> {
	return sendSuccess(res, 201, message, data);
}

/**
 * Send no content response (204)
 * @param res - Express response object
 */
export function sendNoContent(res: Response): Response {
	return res.status(204).send();
}

/**
 * Send bad request error (400)
 * @param res - Express response object
 * @param message - Error message
 * @param errors - Validation errors (optional)
 */
export function sendBadRequest(
	res: Response,
	message: string = "Bad Request",
	errors?: Array<{ path: string; message: string }>,
): Response<ApiResponse<null>> {
	logger.error("400 Error: ", message);
	return sendError(res, 400, message, errors);
}

/**
 * Send unauthorized error (401)
 * @param res - Express response object
 * @param message - Error message
 */
export function sendUnauthorized(
	res: Response,
	message: string = "Unauthorized",
): Response<ApiResponse<null>> {
	logger.error("401 Error: ", message);
	return sendError(res, 401, message);
}

/**
 * Send forbidden error (403)
 * @param res - Express response object
 * @param message - Error message
 */
export function sendForbidden(
	res: Response,
	message: string = "Forbidden",
): Response<ApiResponse<null>> {
	logger.error("403 Error: ", message);
	return sendError(res, 403, message);
}

/**
 * Send not found error (404)
 * @param res - Express response object
 * @param message - Error message
 */
export function sendNotFound(
	res: Response,
	message: string = "Not Found",
): Response<ApiResponse<null>> {
	logger.error("404 Error: ", message);
	return sendError(res, 404, message);
}

/**
 * Send internal server error (500)
 * @param res - Express response object
 * @param message - Error message
 */
export function sendInternalError(
	res: Response,
	message: string = "Internal Server Error",
): Response<ApiResponse<null>> {
	logger.error("500 Error: ", message);
	return sendError(res, 500, message);
}

/**
 * Response handler class for chaining
 */
export class ResponseHandler {
	constructor(private res: Response) {}

	success<T = any>(
		statusCode: number = 200,
		message: string,
		data: T | null = null,
	): Response<ApiResponse<T>> {
		return sendSuccess(this.res, statusCode, message, data);
	}

	error(
		statusCode: number = 500,
		message: string,
		errors?: Array<{ path: string; message: string }>,
	): Response<ApiResponse<null>> {
		return sendError(this.res, statusCode, message, errors);
	}

	created<T = any>(message: string, data: T): Response<ApiResponse<T>> {
		return sendCreated(this.res, message, data);
	}

	noContent(): Response {
		return sendNoContent(this.res);
	}

	badRequest(
		message: string = "Bad Request",
		errors?: Array<{ path: string; message: string }>,
	): Response<ApiResponse<null>> {
		return sendBadRequest(this.res, message, errors);
	}

	unauthorized(message: string = "Unauthorized"): Response<ApiResponse<null>> {
		return sendUnauthorized(this.res, message);
	}

	forbidden(message: string = "Forbidden"): Response<ApiResponse<null>> {
		return sendForbidden(this.res, message);
	}

	notFound(message: string = "Not Found"): Response<ApiResponse<null>> {
		return sendNotFound(this.res, message);
	}

	internalError(
		message: string = "Internal Server Error",
	): Response<ApiResponse<null>> {
		return sendInternalError(this.res, message);
	}
}

/**
 * Create a response handler instance
 * @param res - Express response object
 */
export function createResponseHandler(res: Response): ResponseHandler {
	return new ResponseHandler(res);
}
