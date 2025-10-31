import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import {
	hashToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "@/lib/jwt";
import type { RequestHandler } from "express";
import type { RefreshToken } from "../auth.validation";

// Refresh Token Handler
export const refresh: RequestHandler<{}, unknown, RefreshToken> = async (
	req,
	res,
) => {
	try {
		const { refreshToken } = req.body;

		// Verify refresh token
		let decoded: ReturnType<typeof verifyRefreshToken>;
		try {
			decoded = verifyRefreshToken(refreshToken);
			// oxlint-disable-next-line no-unused-vars
		} catch (_error) {
			return sendError(res, 401, "Invalid or expired refresh token");
		}

		// Find user
		const user = await db.user.findById(decoded.userId);
		if (!user) return sendError(res, 401, "User not found");

		// Check if account is active
		// if (!user.isActive) {
		//   return res.status(403).json({
		//     status: 403,
		//     message: "Account is suspended",
		//     data: null,
		//   });
		// }

		// Verify refresh token exists in database
		const tokenIndex = user?.refreshTokens?.findIndex(
			(rt) => rt.jti === decoded.jti,
		);

		if (tokenIndex === -1) {
			return sendError(res, 401, "Refresh token has been revoked");
		}

		// Generate new tokens
		const tokenPayload = {
			userId: user._id as string,
			email: user.email,
			role: user.role as "customer" | "contractor" | "admin",
		};

		const accessToken = signAccessToken(tokenPayload);
		const { token: newRefreshToken, jti } = signRefreshToken(tokenPayload);

		// Remove old refresh token and add new one
		user?.refreshTokens?.splice(tokenIndex || 0, 1);
		const hashedRefreshToken = await hashToken(newRefreshToken);
		user?.refreshTokens?.push({
			token: hashedRefreshToken,
			jti,
			createdAt: new Date(),
		});
		await user.save();

		return sendSuccess(res, 200, "Tokens refreshed successfully", {
			accessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		console.error("Refresh token error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
