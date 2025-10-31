import { openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	ErrorResponseSchema,
	LoginAdminResponseSchema,
	LoginAdminSchema,
} from "./auth-admin.validation";

// Register schemas
registry.register("LoginAdmin", LoginAdminSchema);
registry.register("LoginAdminResponse", LoginAdminResponseSchema);
registry.register("AdminAuthErrorResponse", ErrorResponseSchema);

// POST /api/admin/auth/login - Admin login
registry.registerPath({
	method: "post",
	path: `${openAPITags.admin.auth.basepath}/login`,
	description: "Admin login with email and password",
	summary: "Admin login",
	tags: [openAPITags.admin.auth.name],
	request: {
		body: {
			content: {
				"application/json": {
					schema: LoginAdminSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Login successful",
			content: {
				"application/json": {
					schema: LoginAdminResponseSchema,
				},
			},
		},
		401: {
			description: "Invalid credentials or not an admin account",
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
