import "./auth.openapi";

import { validateBody } from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	ForgotPasswordSchema,
	LoginSchema,
	RefreshTokenSchema,
	RegisterSchema,
	ResetPasswordSchema,
	VerifyOTPSchema,
} from "./auth.validation";
import {
	forgotPassword,
	login,
	refresh,
	register,
	resetPassword,
	verifyOTP,
} from "./services";

export const auth: Router = express.Router();

// Public routes
auth.post("/register", validateBody(RegisterSchema), register);
auth.post("/login", validateBody(LoginSchema), login);

auth.post(
	"/forgot-password",
	validateBody(ForgotPasswordSchema),
	forgotPassword,
);
auth.post("/verify-otp", validateBody(VerifyOTPSchema), verifyOTP);
auth.post("/reset-password", validateBody(ResetPasswordSchema), resetPassword);
auth.post("/refresh", validateBody(RefreshTokenSchema), refresh);

// Protected routes
// auth.get("/me", requireAuth, me);
