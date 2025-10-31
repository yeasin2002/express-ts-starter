import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Login schema
export const LoginAdminSchema = z
	.object({
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "Admin email address" }),
		password: z
			.string()
			.min(1, "Password is required")
			.openapi({ description: "Admin password" }),
	})
	.openapi("LoginAdmin");

// Admin user data schema (for response)
const AdminUserSchema = z.object({
	_id: z.string(),
	role: z.literal("admin"),
	full_name: z.string(),
	email: z.string(),
	profile_img: z.string().optional(),
	is_verified: z.boolean(),
	createdAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date().optional(),
});

// Login response schema
export const LoginAdminResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.object({
			user: AdminUserSchema,
			accessToken: z.string(),
			refreshToken: z.string(),
		}),
	})
	.openapi("LoginAdminResponse");

// Error response schema
export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null(),
	})
	.openapi("ErrorResponse");

// Type exports
export type LoginAdmin = z.infer<typeof LoginAdminSchema>;
export type LoginAdminResponse = z.infer<typeof LoginAdminResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
