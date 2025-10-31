import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import {
	comparePassword,
	hashToken,
	signAccessToken,
	signRefreshToken,
} from "@/lib/jwt";
import type { RequestHandler } from "express";
import type { Login } from "../auth.validation";

// Login Handler
export const login: RequestHandler<{}, unknown, Login> = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await db.user.findOne({ email });
		if (!user) {
			return sendError(res, 401, "Invalid email or password");
		}

		// Check if account is active
		// if (!user.isActive) {
		//   return res.status(403).json({
		//     status: 403,
		//     message: "Account is suspended. Please contact support.",
		//     data: null,
		//   });
		// }

		// Verify password
		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			return sendError(res, 401, "Invalid email or password");
		}
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

		return sendSuccess(res, 200, "Login successful", {
			user: userWithoutSensitiveData,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error("Login error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
