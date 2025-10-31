import { openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	AuthResponseSchema,
	ErrorResponseSchema,
	ForgotPasswordSchema,
	LoginSchema,
	RefreshTokenSchema,
	RegisterSchema,
	ResetPasswordSchema,
	SuccessResponseSchema,
	TokenResponseSchema,
	UserResponseSchema,
	VerifyOTPSchema,
} from "./auth.validation";

// Register schemas
registry.register("Register", RegisterSchema);
registry.register("Login", LoginSchema);
registry.register("ForgotPassword", ForgotPasswordSchema);
registry.register("VerifyOTP", VerifyOTPSchema);
registry.register("ResetPassword", ResetPasswordSchema);
registry.register("RefreshToken", RefreshTokenSchema);
registry.register("AuthResponse", AuthResponseSchema);
registry.register("TokenResponse", TokenResponseSchema);
registry.register("UserResponse", UserResponseSchema);
registry.register("SuccessResponse", SuccessResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

// POST /api/auth/register
registry.registerPath({
	method: "post",
	path: `${openAPITags.authentication.basepath}/register`,
	description: "Register a new user account",
	summary: "User registration",
	tags: [openAPITags.authentication.name],
	request: {
		body: {
			content: {
				"application/json": {
					schema: RegisterSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "User registered successfully",
			content: {
				"application/json": {
					schema: AuthResponseSchema,
				},
			},
		},
		400: {
			description: "Validation error or user already exists",
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

// POST /api/auth/login
registry.registerPath({
	method: "post",
	path: "/api/auth/login",
	description: "Login with email and password",
	summary: "User login",
	tags: ["Authentication"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: LoginSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Login successful",
			content: {
				"application/json": {
					schema: AuthResponseSchema,
				},
			},
		},
		401: {
			description: "Invalid credentials",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Account suspended",
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

// POST /api/auth/forgot-password
registry.registerPath({
	method: "post",
	path: "/api/auth/forgot-password",
	description: "Request OTP for password reset",
	summary: "Forgot password",
	tags: ["Authentication"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: ForgotPasswordSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "OTP sent if email exists",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		400: {
			description: "Validation error",
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

// POST /api/auth/verify-otp
registry.registerPath({
	method: "post",
	path: "/api/auth/verify-otp",
	description: "Verify OTP before resetting password",
	summary: "Verify OTP",
	tags: ["Authentication"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: VerifyOTPSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "OTP verified successfully",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid OTP or validation error",
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

// POST /api/auth/reset-password
registry.registerPath({
	method: "post",
	path: "/api/auth/reset-password",
	description: "Reset password using verified OTP",
	summary: "Reset password",
	tags: ["Authentication"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: ResetPasswordSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Password reset successfully",
			content: {
				"application/json": {
					schema: SuccessResponseSchema,
				},
			},
		},
		400: {
			description: "Invalid OTP or validation error",
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

// POST /api/auth/refresh
registry.registerPath({
	method: "post",
	path: "/api/auth/refresh",
	description: "Refresh access token using refresh token",
	summary: "Refresh tokens",
	tags: ["Authentication"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: RefreshTokenSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Tokens refreshed successfully",
			content: {
				"application/json": {
					schema: TokenResponseSchema,
				},
			},
		},
		401: {
			description: "Invalid or expired refresh token",
			content: {
				"application/json": {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Account suspended",
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

// GET /api/auth/me
registry.registerPath({
	method: "get",
	path: "/api/auth/me",
	description: "Get current authenticated user",
	summary: "Get current user",
	tags: ["Authentication"],
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "User retrieved successfully",
			content: {
				"application/json": {
					schema: UserResponseSchema,
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

// Register security scheme for bearer auth
registry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
	description: "JWT access token",
});
