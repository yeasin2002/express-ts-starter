import { objectIdSchema } from "@/common/validations";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Base Review Schema
export const ReviewSchema = z
	.object({
		_id: objectIdSchema.openapi({ description: "Review ID" }),
		contractor_id: objectIdSchema.openapi({
			description: "Contractor being reviewed",
		}),
		user_id: objectIdSchema.openapi({
			description: "User who wrote the review",
		}),
		job_id: objectIdSchema
			.optional()
			.openapi({ description: "Related job ID (optional)" }),
		rating: z
			.number()
			.min(0, "Rating must be at least 0")
			.max(5, "Rating must be at most 5")
			.openapi({ description: "Rating from 0 to 5" }),
		rating_message: z
			.string()
			.min(10, "Review message must be at least 10 characters")
			.openapi({ description: "Review message/comment" }),
		createdAt: z.coerce
			.date()
			.optional()
			.openapi({ description: "Creation date" }),
		updatedAt: z.coerce
			.date()
			.optional()
			.openapi({ description: "Last update date" }),
	})
	.openapi("Review");

// Create Review Schema
export const CreateReviewSchema = z
	.object({
		contractor_id: objectIdSchema.openapi({
			description: "Contractor being reviewed (MongoDB ID)",
		}),
		job_id: objectIdSchema
			.optional()
			.openapi({ description: "Related job ID (optional)" }),
		rating: z
			.number()
			.min(0, "Rating must be at least 0")
			.max(5, "Rating must be at most 5")
			.openapi({ description: "Rating from 0 to 5" }),
		rating_message: z
			.string()
			.min(10, "Review message must be at least 10 characters")
			.max(500, "Review message must be at most 500 characters")
			.openapi({ description: "Review message/comment" }),
	})
	.openapi("CreateReview");

// Update Review Schema
export const UpdateReviewSchema = z
	.object({
		rating: z
			.number()
			.min(0, "Rating must be at least 0")
			.max(5, "Rating must be at most 5")
			.optional()
			.openapi({ description: "Rating from 0 to 5" }),
		rating_message: z
			.string()
			.min(10, "Review message must be at least 10 characters")
			.max(500, "Review message must be at most 500 characters")
			.optional()
			.openapi({ description: "Review message/comment" }),
	})
	.openapi("UpdateReview");

// Review ID Param Schema
export const ReviewIdSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Review ID" }),
	})
	.openapi("ReviewIdParam");

// Contractor ID Param Schema
export const ContractorIdSchema = z
	.object({
		contractorId: objectIdSchema.openapi({ description: "Contractor ID" }),
	})
	.openapi("ContractorIdParam");

// Search/Filter Query Schema
export const SearchReviewSchema = z
	.object({
		contractor_id: objectIdSchema
			.optional()
			.openapi({ description: "Filter by contractor ID" }),
		user_id: objectIdSchema
			.optional()
			.openapi({ description: "Filter by user ID" }),
		job_id: objectIdSchema
			.optional()
			.openapi({ description: "Filter by job ID" }),
		minRating: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Minimum rating (0-5)" }),
		maxRating: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Maximum rating (0-5)" }),
		page: z
			.string()
			.regex(/^\d+$/, "Page must be a number")
			.optional()
			.openapi({ description: "Page number" }),
		limit: z
			.string()
			.regex(/^\d+$/, "Limit must be a number")
			.optional()
			.openapi({ description: "Items per page" }),
	})
	.openapi("SearchReview");

// Response Schemas
export const ReviewResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: ReviewSchema.nullable(),
	})
	.openapi("ReviewResponse");

export const ReviewsResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.object({
			reviews: z.array(ReviewSchema),
			total: z.number().openapi({ description: "Total number of reviews" }),
			page: z.number().openapi({ description: "Current page" }),
			limit: z.number().openapi({ description: "Items per page" }),
			totalPages: z.number().openapi({ description: "Total pages" }),
			average: z
				.number()
				.optional()
				.openapi({ description: "Average rating (0-5)" }),
			ratingDistribution: z
				.object({
					"5": z.number(),
					"4": z.number(),
					"3": z.number(),
					"2": z.number(),
					"1": z.number(),
				})
				.optional()
				.openapi({ description: "Distribution of ratings (count per star)" }),
		}),
	})
	.openapi("ReviewsResponse");

export const SuccessResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.null(),
	})
	.openapi("SuccessResponse");

export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.null().optional(),
		errors: z
			.array(
				z.object({
					path: z.string(),
					message: z.string(),
				}),
			)
			.optional(),
	})
	.openapi("ErrorResponse");

// Type exports
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type UpdateReview = z.infer<typeof UpdateReviewSchema>;
export type SearchReview = z.infer<typeof SearchReviewSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
