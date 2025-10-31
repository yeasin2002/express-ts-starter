import { openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	ApplicationIdParamSchema,
	ApplicationResponseSchema,
	ApplicationsResponseSchema,
	ApplyForJobSchema,
	ErrorResponseSchema,
	JobIdParamSchema,
	SearchMyApplicationsSchema,
	SuccessResponseSchema,
} from "./job-request.validation";

// Register schemas
registry.register("ApplyForJob", ApplyForJobSchema);
registry.register("JobIdParam", JobIdParamSchema);
registry.register("ApplicationIdParam", ApplicationIdParamSchema);
registry.register("SearchMyApplications", SearchMyApplicationsSchema);
registry.register("ApplicationResponse", ApplicationResponseSchema);
registry.register("ApplicationsResponse", ApplicationsResponseSchema);
registry.register("JobRequestSuccessResponse", SuccessResponseSchema);
registry.register("JobRequestErrorResponse", ErrorResponseSchema);

// POST /api/job-request/apply/:jobId - Apply for a job
registry.registerPath({
	method: "post",
	path: `${openAPITags.job_request.basepath}/apply/{jobId}`,
	description: "Contractor applies for a job",
	summary: "Apply for job",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: JobIdParamSchema,
		body: {
			content: {
				"application/json": {
					schema: ApplyForJobSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Application submitted successfully",
			content: {
				"application/json": {
					schema: ApplicationResponseSchema,
				},
			},
		},
		400: {
			description:
				"Bad request - already applied or job not accepting applications",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Job not found",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// GET /api/job-request/my - Get contractor's applications
registry.registerPath({
	method: "get",
	path: `${openAPITags.job_request.basepath}/my`,
	description:
		"Get contractor's own job applications with optional search and filters. Supports pagination and filtering by job criteria.",
	summary: "Get my applications",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		query: SearchMyApplicationsSchema,
	},
	responses: {
		200: {
			description:
				"Applications retrieved successfully with pagination information",
			content: {
				"application/json": {
					schema: ApplicationsResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// GET /api/job-request/job/:jobId - Get applications for a job
registry.registerPath({
	method: "get",
	path: `${openAPITags.job_request.basepath}/job/{jobId}`,
	description: "Get all applications for a specific job (Customer only)",
	summary: "Get job applications",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: JobIdParamSchema,
	},
	responses: {
		200: {
			description: "Applications retrieved successfully",
			content: {
				"application/json": {
					schema: ApplicationsResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - not job owner",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Job not found",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// PATCH /api/job-request/:applicationId/accept - Accept application
registry.registerPath({
	method: "patch",
	path: `${openAPITags.job_request.basepath}/{applicationId}/accept`,
	description: "Accept a job application (Customer only)",
	summary: "Accept application",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: ApplicationIdParamSchema,
	},
	responses: {
		200: {
			description: "Application accepted successfully",
			content: {
				"application/json": {
					schema: ApplicationResponseSchema,
				},
			},
		},
		400: {
			description: "Application already processed",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - not job owner",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Application not found",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// PATCH /api/job-request/:applicationId/reject - Reject application
registry.registerPath({
	method: "patch",
	path: `${openAPITags.job_request.basepath}/{applicationId}/reject`,
	description: "Reject a job application (Customer only)",
	summary: "Reject application",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: ApplicationIdParamSchema,
	},
	responses: {
		200: {
			description: "Application rejected successfully",
			content: {
				"application/json": {
					schema: ApplicationResponseSchema,
				},
			},
		},
		400: {
			description: "Application already processed",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - not job owner",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Application not found",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// DELETE /api/job-request/:applicationId - Cancel application
registry.registerPath({
	method: "delete",
	path: `${openAPITags.job_request.basepath}/{applicationId}`,
	description: "Cancel own job application (Contractor only)",
	summary: "Cancel application",
	tags: [openAPITags.job_request.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: ApplicationIdParamSchema,
	},
	responses: {
		200: {
			description: "Application cancelled successfully",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		400: {
			description: "Cannot cancel processed application",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - not application owner",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Application not found",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});
