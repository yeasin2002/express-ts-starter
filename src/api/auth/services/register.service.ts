import { sendWelcomeEmail } from "@/common/email";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import {
	hashPassword,
	hashToken,
	signAccessToken,
	signRefreshToken,
} from "@/lib/jwt";
import type { RequestHandler } from "express";
import type { Register } from "../auth.validation";

// Register Handler
export const register: RequestHandler<{}, unknown, Register> = async (
	req,
	res,
) => {
	try {
		const { email, password, full_name, role, phone } = req.body;
		await sendWelcomeEmail(email, full_name);

		// Check if user already exists
		const existingUser = await db.user.findOne({ email });
		if (existingUser) {
			return sendError(res, 400, "User with this email already exists");
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user
		const user = await db.user.create({
			full_name,
			email,
			password: hashedPassword,
			role: role || "customer",
			phone,
		});

		// Generate tokens
		const tokenPayload = {
			userId: user._id as string,
			email: user.email,
			role: user.role as "customer" | "contractor" | "admin",
		};

		const accessToken = signAccessToken(tokenPayload);
		const { token: refreshToken, jti } = signRefreshToken(tokenPayload);

		// Store hashed refresh token
		const hashedRefreshToken = await hashToken(refreshToken);
		user?.refreshTokens?.push({
      token: hashedRefreshToken,
      jti,
      createdAt: new Date(),
    });
		await user.save();

		// Remove password from response
		const userResponse = user.toObject();
		const {
			password: _password,
			refreshTokens: _refreshTokens,
			otp: _otp,
			...userWithoutSensitiveData
		} = userResponse;

		return sendSuccess(res, 201, "User registered successfully", {
			user: userWithoutSensitiveData,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error("Register error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
