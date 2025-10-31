import { objectIdSchema } from "@/common/validations";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Base Job Schema
export const JobSchema = z
	.object({
		_id: objectIdSchema.openapi({ description: "Job ID" }),
		title: z
			.string()
			.min(5, "Title must be at least 5 characters")
			.openapi({ description: "Job title" }),
		category: z
			.array(objectIdSchema)
			.min(1, "At least one category is required")
			.openapi({ description: "Array of category IDs" }),
		description: z
			.string()
			.min(20, "Description must be at least 20 characters")
			.openapi({ description: "Job description" }),
		location: objectIdSchema.openapi({ description: "Job location ID" }),
		address: z
			.string()
			.min(5, "Address must be at least 5 characters")
			.openapi({ description: "Job address" }),
		budget: z
			.number()
			.positive("Budget must be positive")
			.openapi({ description: "Job budget" }),
		date: z.string().or(z.date()).openapi({ description: "Job date" }),
		coverImg: z
			.string()
			.url("Invalid image URL")
			.openapi({ description: "Cover image URL" }),
		customerId: objectIdSchema.openapi({
			description: "Customer ID who posted the job",
		}),
		contractorId: objectIdSchema
			.optional()
			.openapi({ description: "Assigned contractor ID" }),
		status: z
			.enum(["open", "in_progress", "completed", "cancelled"])
			.openapi({ description: "Job status" }),
		isApplied: z.boolean().optional().openapi({
			description:
				"Indicates if the authenticated contractor has applied to this job",
		}),
		createdAt: z.string().optional().openapi({ description: "Creation date" }),
		updatedAt: z
			.string()
			.optional()
			.openapi({ description: "Last update date" }),
	})
	.openapi("Job");

// Create Job Schema (customer creates job)
export const CreateJobSchema = z
	.object({
		title: z
			.string()
			.min(5, "Title must be at least 5 characters")
			.openapi({ description: "Job title" }),
		category: z
			.array(objectIdSchema)
			.min(1, "At least one category is required")
			.openapi({ description: "Array of category IDs" }),
		description: z
			.string()
			.min(20, "Description must be at least 20 characters")
			.openapi({ description: "Job description" }),
		location: objectIdSchema.openapi({ description: "Job location ID" }),
		address: z
			.string()
			.min(5, "Address must be at least 5 characters")
			.openapi({ description: "Job address" }),
		budget: z
			.number()
			.positive("Budget must be positive")
			.openapi({ description: "Job budget" }),
		date: z
			.string()
			.or(z.date())
			.optional()
			.openapi({ description: "Job date" }),
		coverImg: z.string().openapi({ description: "Cover image URL" }),
	})
	.openapi("CreateJob");

// Update Job Schema
export const UpdateJobSchema = z
	.object({
		title: z.string().min(5, "Title must be at least 5 characters").optional(),
		category: z
			.array(objectIdSchema)
			.min(1, "At least one category is required")
			.optional(),
		description: z
			.string()
			.min(20, "Description must be at least 20 characters")
			.optional(),
		location: objectIdSchema.optional(),
		address: z
			.string()
			.min(5, "Address must be at least 5 characters")
			.optional(),
		budget: z.number().positive("Budget must be positive").optional(),
		date: z.string().or(z.date()).optional(),
		coverImg: z.string().url("Invalid image URL").optional(),
		status: z
			.enum(["open", "in_progress", "completed", "cancelled"])
			.optional(),
	})
	.openapi("UpdateJob");

// Job ID Param Schema
export const JobIdSchema = z
	.object({
		id: objectIdSchema.openapi({ description: "Job ID" }),
	})
	.openapi("JobIdParam");

// Search/Filter Query Schema
export const SearchJobSchema = z
	.object({
		search: z
			.string()
			.optional()
			.openapi({ description: "Search term for title or description" }),
		category: z
			.string()
			.refine((val) => !val || isValidObjectId(val), {
				message: "Invalid category ID format",
			})
			.optional()
			.openapi({ description: "Filter by category ID" }),
		status: z
			.enum(["open", "in_progress", "completed", "cancelled"])
			.optional()
			.openapi({ description: "Filter by status" }),
		minBudget: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Minimum budget" }),
		maxBudget: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Maximum budget" }),
		location: z
			.string()
			.refine((val) => !val || isValidObjectId(val), {
				message: "Invalid location ID format",
			})
			.optional()
			.openapi({ description: "Filter by location ID" }),
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
	.openapi("SearchJob");

// Response Schemas
export const JobResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: JobSchema.nullable(),
	})
	.openapi("JobResponse");

export const JobsResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.object({
			jobs: z.array(JobSchema),
			total: z.number().openapi({ description: "Total number of jobs" }),
			page: z.number().openapi({ description: "Current page" }),
			limit: z.number().openapi({ description: "Items per page" }),
			totalPages: z.number().openapi({ description: "Total pages" }),
		}),
	})
	.openapi("JobsResponse");

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
export type Job = z.infer<typeof JobSchema>;
export type CreateJob = z.infer<typeof CreateJobSchema>;
export type UpdateJob = z.infer<typeof UpdateJobSchema>;
export type SearchJob = z.infer<typeof SearchJobSchema>;
export type JobResponse = z.infer<typeof JobResponseSchema>;
export type JobsResponse = z.infer<typeof JobsResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
