import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { objectIdSchema } from "./mongodb-id.validation";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Common Parameter Schemas
 * These schemas can be reused across all API modules for consistent parameter validation
 */

// ============================================
// ID Parameter Schemas
// ============================================

/**
 * Generic ID parameter (MongoDB ObjectId)
 * Use for routes like /:id
 */
export const IdParamSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Resource ID" }),
	})
	.openapi("IdParam");

/**
 * User ID parameter
 */
export const UserIdParamSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "User ID" }),
	})
	.openapi("UserIdParam");

/**
 * Job ID parameter
 */
export const JobIdParamSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Job ID" }),
	})
	.openapi("JobIdParam");

/**
 * Category ID parameter
 */
export const CategoryIdParamSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Category ID" }),
	})
	.openapi("CategoryIdParam");

/**
 * Location ID parameter
 */
export const LocationIdParamSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Location ID" }),
	})
	.openapi("LocationIdParam");

// ============================================
// Pagination Query Schemas
// ============================================

/**
 * Basic pagination query parameters
 */
export const PaginationQuerySchema = z
	.object({
		page: z
			.string()
			.regex(/^\d+$/, "Page must be a number")
			.optional()
			.openapi({ description: "Page number (default: 1)", example: "1" }),
		limit: z
			.string()
			.regex(/^\d+$/, "Limit must be a number")
			.optional()
			.openapi({ description: "Items per page (default: 10)", example: "10" }),
	})
	.openapi("PaginationQuery");

/**
 * Pagination with transform (converts string to number)
 */
export const PaginationQueryTransformSchema = z
	.object({
		page: z
			.string()
			.optional()
			.transform((val) => (val ? Number.parseInt(val, 10) : 1))
			.openapi({ description: "Page number (default: 1)", example: "1" }),
		limit: z
			.string()
			.optional()
			.transform((val) => (val ? Number.parseInt(val, 10) : 10))
			.openapi({ description: "Items per page (default: 10)", example: "10" }),
	})
	.openapi("PaginationQueryTransform");

/**
 * Pagination with sorting
 */
export const PaginationWithSortQuerySchema = z
	.object({
		page: z
			.string()
			.optional()
			.transform((val) => (val ? Number.parseInt(val, 10) : 1))
			.openapi({ description: "Page number (default: 1)", example: "1" }),
		limit: z
			.string()
			.optional()
			.transform((val) => (val ? Number.parseInt(val, 10) : 10))
			.openapi({ description: "Items per page (default: 10)", example: "10" }),
		sortBy: z.string().optional().openapi({
			description: "Field to sort by (default: createdAt)",
			example: "createdAt",
		}),
		sortOrder: z.enum(["asc", "desc"]).optional().openapi({
			description: "Sort order (default: desc)",
			example: "desc",
		}),
	})
	.openapi("PaginationWithSortQuery");

// ============================================
// Search Query Schemas
// ============================================

/**
 * Basic search query parameter
 */
export const SearchQuerySchema = z
	.object({
		search: z.string().optional().openapi({
			description: "Search term",
			example: "keyword",
		}),
	})
	.openapi("SearchQuery");

/**
 * Search with pagination
 */
export const SearchWithPaginationQuerySchema = z
	.object({
		search: z.string().optional().openapi({
			description: "Search term",
			example: "keyword",
		}),
		page: z
			.string()
			.regex(/^\d+$/, "Page must be a number")
			.optional()
			.openapi({ description: "Page number (default: 1)", example: "1" }),
		limit: z
			.string()
			.regex(/^\d+$/, "Limit must be a number")
			.optional()
			.openapi({ description: "Items per page (default: 10)", example: "10" }),
	})
	.openapi("SearchWithPaginationQuery");

// ============================================
// Type Exports
// ============================================

export type IdParam = z.infer<typeof IdParamSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type JobIdParam = z.infer<typeof JobIdParamSchema>;
export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;
export type LocationIdParam = z.infer<typeof LocationIdParamSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationQueryTransform = z.infer<
	typeof PaginationQueryTransformSchema
>;
export type PaginationWithSortQuery = z.infer<
	typeof PaginationWithSortQuerySchema
>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchWithPaginationQuery = z.infer<
	typeof SearchWithPaginationQuerySchema
>;
