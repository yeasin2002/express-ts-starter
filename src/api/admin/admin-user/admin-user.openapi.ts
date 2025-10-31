import { openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	ErrorResponseSchema,
	SuccessResponseSchema,
	SuspendUserSchema,
	UserIdParamSchema,
	UserQuerySchema,
	UserResponseSchema,
	UsersResponseSchema,
} from "./admin-user.validation";

// Register schemas
registry.register("UserIdParam", UserIdParamSchema);
registry.register("UserQuery", UserQuerySchema);
registry.register("SuspendUser", SuspendUserSchema);
registry.register("AdminUserResponse", UserResponseSchema);
registry.register("AdminUsersResponse", UsersResponseSchema);
registry.register("AdminSuccessResponse", SuccessResponseSchema);
registry.register("AdminErrorResponse", ErrorResponseSchema);

// GET /api/admin/users - Get all users with pagination
registry.registerPath({
	method: "get",
	path: `${openAPITags.admin.user_management.basepath}`,
	description:
		"Get all users with optional search, filters, and pagination. Supports filtering by role, location, category, and searching by name or email.",
	summary: "Retrieve all users with pagination",
	tags: [openAPITags.admin.user_management.name],
	request: {
		query: UserQuerySchema,
	},
	responses: {
		200: {
			description: "Users retrieved successfully with pagination metadata",
			content: {
				"application/json": {
					schema: UsersResponseSchema,
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

// GET /api/admin/users/{id} - Get single user
registry.registerPath({
	method: "get",
	path: `${openAPITags.admin.user_management.basepath}/{id}`,
	description: "Get a single user by ID with full details",
	summary: "Retrieve user by ID",
	tags: [openAPITags.admin.user_management.name],
	request: {
		params: UserIdParamSchema,
	},
	responses: {
		200: {
			description: "User retrieved successfully",
			content: {
				"application/json": {
					schema: UserResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
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

// DELETE /api/admin/users/{id} - Delete user
registry.registerPath({
	method: "delete",
	path: `${openAPITags.admin.user_management.basepath}/{id}`,
	description: "Permanently delete a user account",
	summary: "Delete user account",
	tags: [openAPITags.admin.user_management.name],
	request: {
		params: UserIdParamSchema,
	},
	responses: {
		200: {
			description: "User deleted successfully",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
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

// PATCH /api/admin/users/{id}/suspend - Suspend/unsuspend user
registry.registerPath({
	method: "patch",
	path: `${openAPITags.admin.user_management.basepath}/{id}/suspend`,
	description: "Suspend or unsuspend a user account",
	summary: "Suspend/unsuspend user",
	tags: [openAPITags.admin.user_management.name],
	request: {
		params: UserIdParamSchema,
		body: {
			content: {
				"application/json": {
					schema: SuspendUserSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "User suspension status updated successfully",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
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
