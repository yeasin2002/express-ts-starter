import { mediaTypeFormat, openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
  ErrorResponseSchema,
  UpdateProfileSchema,
  UserIdParamSchema,
  UserQuerySchema,
  UserResponseSchema,
  UsersResponseSchema,
} from "./users.validation";

// GET /api/users - Get all users with pagination
registry.registerPath({
	method: "get",
	path: openAPITags.user.all_users.basepath,
	description:
		"Get all users with optional search, filters, and pagination. Supports filtering by role, location, category, and searching by name or email. Returns users with populated location, category, experience, work_samples, certification, and review statistics (for contractors).",
	summary: "Retrieve all users with pagination",
	tags: [openAPITags.user.all_users.name],
	request: {
		query: UserQuerySchema,
	},
	responses: {
		200: {
			description:
				"Users retrieved successfully with pagination metadata. Each user includes populated location, category, experience, work_samples, and certification. Contractors include review statistics (total, average, rating distribution, and last 5 reviews).",
			content: {
				[mediaTypeFormat.json]: {
					schema: UsersResponseSchema,
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

// GET /api/user/:id - Get single user by ID
registry.registerPath({
	method: "get",
	path: `${openAPITags.user.all_users.basepath}{id}`,
	description:
		"Get a single user by ID with full profile details including populated location, category, experience, work_samples, certifications, and jobs. For contractors, includes review statistics (total, average rating, rating distribution, and last 5 reviews).",
	summary: "Get user by ID",
	tags: [openAPITags.user.all_users.name],
	request: {
		params: UserIdParamSchema,
	},
	responses: {
		200: {
			description:
				"User retrieved successfully with all populated fields. Contractors include review statistics.",
			content: {
				[mediaTypeFormat.json]: {
					schema: UserResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
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

// GET /api/user/me
registry.registerPath({
	method: "get",
	path: openAPITags.user.me.basepath,
	description:
		"Get current authenticated user with full profile details including populated location, category, experience, work_samples, certification, and review statistics (for contractors)",
	summary: "Get current user profile",
	tags: [openAPITags.user.me.name],
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description:
				"User retrieved successfully with populated location, category, experience, work_samples, and certification. For contractors, includes review statistics (total, average rating, rating distribution, and last 5 reviews). Excludes sensitive fields (password, refreshTokens, otp).",
			content: {
				[mediaTypeFormat.json]: {
					schema: UserResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized - Invalid or missing access token",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
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

// PATCH /api/user/me - Update profile
registry.registerPath({
  method: "patch",
  path: openAPITags.user.me.basepath,
  description:
    "Update current user profile. Customers can update basic info (name, phone, address, bio, location, images). Contractors can additionally update skills, experience, work samples, certifications, hourly rate, and categories. All fields are optional - only send fields you want to update.",
  summary: "Update user profile",
  tags: [openAPITags.user.me.name],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        [mediaTypeFormat.json]: {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Profile updated successfully with populated location, category, experience, work_samples, certification, and review statistics (for contractors)",
      content: {
        [mediaTypeFormat.json]: {
          schema: UserResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error or invalid category/location IDs",
      content: {
        [mediaTypeFormat.json]: {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - Invalid or missing access token",
      content: {
        [mediaTypeFormat.json]: {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
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
