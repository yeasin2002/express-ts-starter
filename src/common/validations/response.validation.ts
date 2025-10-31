import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Common Response Schemas
 * These schemas can be reused across all API modules for consistent response formats
 */

// ============================================
// Basic Response Schemas
// ============================================

/**
 * Success Response (no data)
 * Use for operations that don't return data (delete, update without returning object)
 */
export const SuccessResponseSchema = z
	.object({
		status: z.number().openapi({ example: 200 }),
		message: z.string().openapi({ example: "Operation successful" }),
		data: z.null(),
	})
	.openapi("SuccessResponse");

/**
 * Success Response with boolean flag
 * Alternative format used by some modules (auth, location)
 */
export const SuccessResponseWithFlagSchema = z
	.object({
		status: z.number().openapi({ example: 200 }),
		message: z.string().openapi({ example: "Operation successful" }),
		success: z.boolean().openapi({ example: true }),
		data: z.null(),
	})
	.openapi("SuccessResponseWithFlag");

// ============================================
// Error Response Schemas
// ============================================

/**
 * Basic Error Response
 * Use for simple error messages
 */
export const ErrorResponseSchema = z
	.object({
		status: z.number().openapi({ example: 400 }),
		message: z.string().openapi({ example: "An error occurred" }),
		data: z.null().optional(),
	})
	.openapi("ErrorResponse");

/**
 * Error Response with success flag
 * Alternative format used by some modules
 */
export const ErrorResponseWithFlagSchema = z
	.object({
		status: z.number().openapi({ example: 400 }),
		message: z.string().openapi({ example: "An error occurred" }),
		success: z.boolean().openapi({ example: false }),
		data: z.null().optional(),
	})
	.openapi("ErrorResponseWithFlag");

/**
 * Validation Error Response
 * Use for validation errors with detailed field-level errors
 */
export const ValidationErrorResponseSchema = z
	.object({
		status: z.number().openapi({ example: 400 }),
		message: z.string().openapi({ example: "Validation failed" }),
		success: z.boolean().openapi({ example: false }),
		data: z.null().optional(),
		errors: z
			.array(
				z.object({
					path: z.string().openapi({ example: "email" }),
					message: z.string().openapi({ example: "Invalid email format" }),
				}),
			)
			.openapi({ description: "Array of validation errors" }),
	})
	.openapi("ValidationErrorResponse");

// ============================================
// HTTP Status-Specific Error Schemas
// ============================================

/**
 * 400 Bad Request Response
 */
export const BadRequestResponseSchema = z
	.object({
		status: z.literal(400),
		message: z.string().openapi({ example: "Bad request" }),
		data: z.null().optional(),
	})
	.openapi("BadRequestResponse");

/**
 * 401 Unauthorized Response
 */
export const UnauthorizedResponseSchema = z
	.object({
		status: z.literal(401),
		message: z.string().openapi({ example: "Unauthorized" }),
		data: z.null().optional(),
	})
	.openapi("UnauthorizedResponse");

/**
 * 403 Forbidden Response
 */
export const ForbiddenResponseSchema = z
	.object({
		status: z.literal(403),
		message: z.string().openapi({ example: "Forbidden" }),
		data: z.null().optional(),
	})
	.openapi("ForbiddenResponse");

/**
 * 404 Not Found Response
 */
export const NotFoundResponseSchema = z
	.object({
		status: z.literal(404),
		message: z.string().openapi({ example: "Resource not found" }),
		data: z.null().optional(),
	})
	.openapi("NotFoundResponse");

/**
 * 409 Conflict Response
 */
export const ConflictResponseSchema = z
	.object({
		status: z.literal(409),
		message: z.string().openapi({ example: "Resource already exists" }),
		data: z.null().optional(),
	})
	.openapi("ConflictResponse");

/**
 * 500 Internal Server Error Response
 */
export const InternalServerErrorResponseSchema = z
	.object({
		status: z.literal(500),
		message: z.string().openapi({ example: "Internal server error" }),
		data: z.null().optional(),
	})
	.openapi("InternalServerErrorResponse");

// ============================================
// Pagination Schema
// ============================================

/**
 * Pagination Metadata
 * Use for paginated list responses
 */
export const PaginationMetadataSchema = z
	.object({
		currentPage: z.number().openapi({ example: 1 }),
		totalPages: z.number().openapi({ example: 10 }),
		total: z.number().openapi({ example: 100 }),
		limit: z.number().openapi({ example: 10 }),
		hasNextPage: z.boolean().openapi({ example: true }),
		hasPrevPage: z.boolean().openapi({ example: false }),
	})
	.openapi("PaginationMetadata");

/**
 * Alternative pagination format (used by some modules)
 */
export const SimplePaginationSchema = z
	.object({
		total: z.number().openapi({ example: 100 }),
		page: z.number().openapi({ example: 1 }),
		limit: z.number().openapi({ example: 10 }),
		totalPages: z.number().openapi({ example: 10 }),
	})
	.openapi("SimplePagination");

// ============================================
// Type Exports
// ============================================

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type SuccessResponseWithFlag = z.infer<
	typeof SuccessResponseWithFlagSchema
>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ErrorResponseWithFlag = z.infer<typeof ErrorResponseWithFlagSchema>;
export type ValidationErrorResponse = z.infer<
	typeof ValidationErrorResponseSchema
>;
export type BadRequestResponse = z.infer<typeof BadRequestResponseSchema>;
export type UnauthorizedResponse = z.infer<typeof UnauthorizedResponseSchema>;
export type ForbiddenResponse = z.infer<typeof ForbiddenResponseSchema>;
export type NotFoundResponse = z.infer<typeof NotFoundResponseSchema>;
export type ConflictResponse = z.infer<typeof ConflictResponseSchema>;
export type InternalServerErrorResponse = z.infer<
	typeof InternalServerErrorResponseSchema
>;
export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;
export type SimplePagination = z.infer<typeof SimplePaginationSchema>;
