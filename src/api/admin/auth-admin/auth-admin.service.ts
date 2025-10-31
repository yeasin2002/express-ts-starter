import type { LoginAdmin } from "@/api/admin/auth-admin/auth-admin.validation";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import {
	comparePassword,
	hashToken,
	signAccessToken,
	signRefreshToken,
} from "@/lib";
import type { RequestHandler } from "express";

/**
 * Admin login handler
 * Authenticates admin users and returns access/refresh tokens
 */
export const loginAdmin: RequestHandler<{}, any, LoginAdmin> = async (
	req,
	res,
) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await db.user.findOne({ email });
		if (!user) {
			return sendError(res, 401, "User not found");
		}

		// Check if account is an admin
		if (user.role !== "admin") {
			return sendError(res, 401, "User is not an admin");
		}

		// Verify password
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return sendError(res, 401, "Invalid password");
		}

		// Generate tokens
		const tokenPayload = {
			userId: String(user._id),
			email: user.email,
			role: "admin" as const,
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

		// Remove sensitive data from response
		const userResponse = user.toObject();
		const {
			password: _password,
			refreshTokens: _refreshTokens,
			otp: _otp,
			...userWithoutSensitiveData
		} = userResponse;

		return sendSuccess(res, 200, "Login successful", {
			user: userWithoutSensitiveData,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error("Admin login error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
