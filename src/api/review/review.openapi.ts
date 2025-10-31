import { mediaTypeFormat, openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	ContractorIdSchema,
	CreateReviewSchema,
	ErrorResponseSchema,
	ReviewIdSchema,
	ReviewResponseSchema,
	ReviewsResponseSchema,
	SearchReviewSchema,
	SuccessResponseSchema,
	UpdateReviewSchema,
} from "./review.validation";

// Register schemas
registry.register("CreateReview", CreateReviewSchema);
registry.register("UpdateReview", UpdateReviewSchema);
registry.register("ReviewIdParam", ReviewIdSchema);
registry.register("ContractorIdParam", ContractorIdSchema);
registry.register("SearchReview", SearchReviewSchema);
registry.register("ReviewResponse", ReviewResponseSchema);
registry.register("ReviewsResponse", ReviewsResponseSchema);
registry.register("ReviewSuccessResponse", SuccessResponseSchema);
registry.register("ReviewErrorResponse", ErrorResponseSchema);

// GET /api/review - Get all reviews
registry.registerPath({
	method: "get",
	path: openAPITags.review.basepath,
	description:
		"Get all reviews with optional filters (contractor, user, job, rating range) and pagination",
	summary: "Get all reviews",
	tags: [openAPITags.review.name],
	request: {
		query: SearchReviewSchema,
	},
	responses: {
		200: {
			description:
				"Reviews retrieved successfully with pagination and average rating",
			content: {
				[mediaTypeFormat.json]: {
					schema: ReviewsResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// GET /api/review/contractor/:contractorId - Get contractor reviews
registry.registerPath({
	method: "get",
	path: `${openAPITags.review.basepath}/contractor/{contractorId}`,
	description:
		"Get all reviews for a specific contractor with pagination and average rating calculation",
	summary: "Get contractor reviews",
	tags: [openAPITags.review.name],
	request: {
		params: ContractorIdSchema,
		query: SearchReviewSchema,
	},
	responses: {
		200: {
			description:
				"Contractor reviews retrieved successfully with average rating",
			content: {
				[mediaTypeFormat.json]: {
					schema: ReviewsResponseSchema,
				},
			},
		},
		400: {
			description: "User is not a contractor",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Contractor not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// GET /api/review/my - Get my reviews
registry.registerPath({
	method: "get",
	path: `${openAPITags.review.basepath}/my`,
	description: "Get all reviews written by the authenticated user",
	summary: "Get my reviews",
	tags: [openAPITags.review.name],
	security: [{ bearerAuth: [] }],
	request: {
		query: SearchReviewSchema,
	},
	responses: {
		200: {
			description: "Your reviews retrieved successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: ReviewsResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// POST /api/review - Create review
registry.registerPath({
	method: "post",
	path: openAPITags.review.basepath,
	description:
		"Create a new review for a contractor. Users cannot review themselves or review the same contractor twice for the same job.",
	summary: "Create review",
	tags: [openAPITags.review.name],
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				[mediaTypeFormat.json]: {
					schema: CreateReviewSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Review created successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: ReviewResponseSchema,
				},
			},
		},
		400: {
			description:
				"Bad request - Cannot review yourself, already reviewed, or invalid contractor",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Contractor or job not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// PUT /api/review/:id - Update review
registry.registerPath({
	method: "put",
	path: `${openAPITags.review.basepath}/{id}`,
	description:
		"Update a review. Only the review author can update their review.",
	summary: "Update review",
	tags: [openAPITags.review.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: ReviewIdSchema,
		body: {
			content: {
				[mediaTypeFormat.json]: {
					schema: UpdateReviewSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Review updated successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: ReviewResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - You can only update your own reviews",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Review not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// DELETE /api/review/:id - Delete review
registry.registerPath({
	method: "delete",
	path: `${openAPITags.review.basepath}/{id}`,
	description:
		"Delete a review. Only the review author can delete their review.",
	summary: "Delete review",
	tags: [openAPITags.review.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: ReviewIdSchema,
	},
	responses: {
		200: {
			description: "Review deleted successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: SuccessResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - You can only delete your own reviews",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Review not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// Register security scheme for bearer auth
registry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
	description: "JWT access token",
});
