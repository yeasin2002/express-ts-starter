import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

const icon = z
	.any()
	.openapi({ description: "Category icon file" })
	.refine((file) => file !== null, {
		message: "Icon file is required",
	});

export const CategorySchema = z
	.object({
		_id: z.string().openapi({ description: "Category ID" }),
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.openapi({ description: "Category name" }),
		icon: icon,

		description: z
			.string()
			.optional()
			.openapi({ description: "Category description" }),

		createdAt: z.string().optional().openapi({ description: "Creation date" }),
		updatedAt: z
			.string()
			.optional()
			.openapi({ description: "Last update date" }),
	})
	.openapi("Category");

// Create Category Schema (icon will be uploaded via multipart/form-data)
export const CreateCategorySchema = z
	.object({
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.openapi({ description: "Category name" }),
		description: z
			.string()
			.optional()
			.openapi({ description: "Category description" }),
		icon: icon,
		// icon: z.any().openapi({ description: "Category icon" }),
		// icon: z
		//   .string()
		//   .min(1, "Icon is required")
		//   .openapi({ description: "Category icon URL (uploaded image path)" }),
	})
	.openapi("CreateCategory");

// Update Category Schema (all fields optional, icon uploaded separately)
export const UpdateCategorySchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters").optional(),
		description: z.string().optional(),
		icon: icon.optional(),
		// icon: z
		//   .string()
		//   .min(1, "Icon is required")
		//   .openapi({ description: "Category icon URL (uploaded image path)" }),
	})
	.openapi("UpdateCategory");

// Category ID Param Schema
export const CategoryIdSchema = z
	.object({
		id: z
			.string()
			.min(1, "Category ID is required")
			.openapi({ description: "Category ID" }),
	})
	.openapi("CategoryIdParam");

// Search Query Schema
export const SearchCategorySchema = z
	.object({
		search: z
			.string()
			.optional()
			.openapi({ description: "Search term for category name or description" }),
		page: z
			.string()
			.regex(/^\d+$/, "Page must be a number")
			.optional()
			.openapi({ description: "Page number for pagination" }),
		limit: z
			.string()
			.regex(/^\d+$/, "Limit must be a number")
			.optional()
			.openapi({ description: "Number of items per page" }),
	})
	.openapi("SearchCategory");

// Response Schemas
export const CategoryResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: CategorySchema.nullable(),
	})
	.openapi("CategoryResponse");

export const CategoriesResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.object({
			categories: z.array(CategorySchema),
			total: z.number().openapi({ description: "Total number of categories" }),
			page: z.number().openapi({ description: "Current page" }),
			limit: z.number().openapi({ description: "Items per page" }),
			totalPages: z.number().openapi({ description: "Total pages" }),
		}),
	})
	.openapi("CategoriesResponse");

export const SuccessResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null(),
	})
	.openapi("SuccessResponse");

export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null().optional(),
	})
	.openapi("ErrorResponse");

// Type exports
export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type SearchCategory = z.infer<typeof SearchCategorySchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// - Icon refactor
// .superRefine((file, ctx) => {
//   if (!file) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Icon file is required",
//     });
//     return;
//   }

//   if (!file.mimetype?.startsWith("image/")) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Only image files are allowed",
//     });
//   }

//   if (file.size > 5 * 1024 * 1024) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "File size must be under 5MB",
//     });
//   }
// });

// Base Category Schema
