import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Register Schema
export const RegisterSchema = z
	.object({
		full_name: z
			.string()
			.min(1, "Full name is required")
			.openapi({ description: "User's full name" }),
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "User's email address" }),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.openapi({ description: "User's password" }),
		role: z
			.enum(["customer", "contractor", "admin"])
			.default("customer")
			.openapi({ description: "User role" }),
		phone: z
			.string()
			.optional()
			.openapi({ description: "User's phone number" }),
	})
	.openapi("Register");

// Login Schema
export const LoginSchema = z
	.object({
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "User's email address" }),
		password: z
			.string()
			.min(1, "Password is required")
			.openapi({ description: "User's password" }),
	})
	.openapi("Login");

// Forgot Password Schema
export const ForgotPasswordSchema = z
	.object({
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "User's email address" }),
	})
	.openapi("ForgotPassword");

// Verify OTP Schema
export const VerifyOTPSchema = z
	.object({
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "User's email address" }),
		otp: z
			.string()
			.length(4, "OTP must be 4 digits")
			.openapi({ description: "4-digit OTP code" }),
	})
	.openapi("VerifyOTP");

// Reset Password Schema
export const ResetPasswordSchema = z
	.object({
		email: z
			.string()
			.email("Invalid email format")
			.openapi({ description: "User's email address" }),
		otp: z
			.string()
			.length(4, "OTP must be 4 digits")
			.openapi({ description: "4-digit OTP code" }),
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.openapi({ description: "New password" }),
	})
	.openapi("ResetPassword");

// Refresh Token Schema
export const RefreshTokenSchema = z
	.object({
		refreshToken: z
			.string()
			.min(1, "Refresh token is required")
			.openapi({ description: "Refresh token" }),
	})
	.openapi("RefreshToken");

// User Response Schema (without password)
export const UserDataSchema = z
	.object({
		_id: z.string().openapi({ description: "User ID" }),
		full_name: z.string().openapi({ description: "User's full name" }),
		email: z.string().openapi({ description: "User's email address" }),
		role: z
			.enum(["customer", "contractor", "admin"])
			.openapi({ description: "User role" }),
		phone: z
			.string()
			.optional()
			.openapi({ description: "User's phone number" }),
		is_verified: z.boolean().openapi({ description: "Verification status" }),
		createdAt: z.string().openapi({ description: "Account creation date" }),
		updatedAt: z.string().openapi({ description: "Last update date" }),
	})
	.openapi("UserData");

// Auth Response Schema
export const AuthResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.object({
			user: UserDataSchema,
			accessToken: z.string().openapi({ description: "JWT access token" }),
			refreshToken: z.string().openapi({ description: "JWT refresh token" }),
		}),
	})
	.openapi("AuthResponse");

// Token Response Schema
export const TokenResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.object({
			accessToken: z.string().openapi({ description: "JWT access token" }),
			refreshToken: z.string().openapi({ description: "JWT refresh token" }),
		}),
	})
	.openapi("TokenResponse");

// User Response Schema
export const UserResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: UserDataSchema,
	})
	.openapi("UserResponse");

// Success Response Schema
export const SuccessResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.null(),
	})
	.openapi("SuccessResponse");

// Error Response Schema
export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null().optional(),
		success: z.boolean(),
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
export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type VerifyOTP = z.infer<typeof VerifyOTPSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
