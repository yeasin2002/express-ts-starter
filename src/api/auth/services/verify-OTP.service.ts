import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";
import type { VerifyOTP } from "../auth.validation";

// Verify OTP Handler
export const verifyOTP: RequestHandler<{}, unknown, VerifyOTP> = async (
	req,
	res,
) => {
	try {
		const { email, otp } = req.body;

		// Find user
		const user = await db.user.findOne({ email });
		if (!user) {
			return sendError(res, 404, "User not found");
		}

		// Verify OTP
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

		// OTP is valid - don't mark as used yet, will be used in reset password
		return sendSuccess(
			res,
			200,
			"OTP verified successfully. You can now reset your password.",
		);
	} catch (error) {
		console.error("Verify OTP error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
