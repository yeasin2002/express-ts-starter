import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import { hashPassword } from "@/lib/jwt";
import type { RequestHandler } from "express";
import type { ResetPassword } from "../auth.validation";

// reset password handler
export const resetPassword: RequestHandler<{}, unknown, ResetPassword> = async (
	req,
	res,
) => {
	try {
		const { email, otp, newPassword } = req.body;

		// Find user
		const user = await db.user.findOne({ email });
		if (!user) {
			return sendError(res, 404, "User not found");
		}

		// Verify OTP again (in case user skips verify step)
		if (!user.otp || !user.otp.code) {
			return sendError(res, 400, "No OTP found. Please request a new one.");
		}

		if (user.otp.used) {
			return sendError(res, 400, "OTP has already been used");
		}

		if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
			return sendError(res, 400, "OTP has expired. Please request a new one.");
		}

		if (user.otp.code !== otp) {
			return sendError(res, 400, "Invalid OTP");
		}

		// Hash new password
		const hashedPassword = await hashPassword(newPassword);

		// Update password and mark OTP as used
		user.password = hashedPassword;
		user.otp.used = true;

		// Invalidate all refresh tokens for security
		user.refreshTokens = [] as any;

		await user.save();

		return sendSuccess(
			res,
			200,
			"Password reset successfully. Please login with your new password.",
			null,
		);
	} catch (error) {
		console.error("Reset password error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
