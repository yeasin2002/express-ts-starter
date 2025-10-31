import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Apply for job schema
export const ApplyForJobSchema = z
	.object({
		message: z
			.string()
			.optional()
			.openapi({ description: "Optional message to the job owner" }),
	})
	.openapi("ApplyForJob");

// Job ID parameter schema
export const JobIdParamSchema = z
	.object({
		jobId: z
			.string()
			.min(1, "Job ID is required")
			.openapi({ description: "Job ID" }),
	})
	.openapi("JobIdParam");

// Application ID parameter schema
export const ApplicationIdParamSchema = z
	.object({
		applicationId: z
			.string()
			.min(1, "Application ID is required")
			.openapi({ description: "Application ID" }),
	})
	.openapi("ApplicationIdParam");

// Search/Filter Query Schema for My Applications
export const SearchMyApplicationsSchema = z
	.object({
		search: z
			.string()
			.optional()
			.openapi({ description: "Search term for job title or description" }),
		category: z
			.string()
			.optional()
			.openapi({ description: "Filter by category ID" }),
		status: z
			.enum(["pending", "accepted", "rejected"])
			.optional()
			.openapi({ description: "Filter by application status" }),
		minBudget: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Minimum job budget" }),
		maxBudget: z
			.string()
			.regex(/^\d+$/, "Must be a number")
			.optional()
			.openapi({ description: "Maximum job budget" }),
		location: z
			.string()
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
	.openapi("SearchMyApplications");

// Application data schema
const ApplicationDataSchema = z.object({
	_id: z.string(),
	job: z.any(),
	contractor: z.any(),
	status: z.enum(["pending", "accepted", "rejected"]),
	message: z.string().optional(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Response schemas
export const ApplicationResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: ApplicationDataSchema,
	})
	.openapi("ApplicationResponse");

export const ApplicationsResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.object({
			applications: z.array(ApplicationDataSchema),
			total: z
				.number()
				.openapi({ description: "Total number of applications" }),
			page: z.number().openapi({ description: "Current page" }),
			limit: z.number().openapi({ description: "Items per page" }),
			totalPages: z.number().openapi({ description: "Total pages" }),
		}),
	})
	.openapi("ApplicationsResponse");

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
		data: z.null(),
	})
	.openapi("ErrorResponse");

// Type exports
export type ApplyForJob = z.infer<typeof ApplyForJobSchema>;
export type JobIdParam = z.infer<typeof JobIdParamSchema>;
export type ApplicationIdParam = z.infer<typeof ApplicationIdParamSchema>;
export type SearchMyApplications = z.infer<typeof SearchMyApplicationsSchema>;
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;
export type ApplicationsResponse = z.infer<typeof ApplicationsResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
