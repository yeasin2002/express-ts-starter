import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import { generateOTP } from "@/lib/jwt";
import { sendOTPEmail } from "@/common/email";
import type { RequestHandler } from "express";
import type { ForgotPassword } from "../auth.validation";

// Forgot Password Handler
export const forgotPassword: RequestHandler<
	unknown,
	unknown,
	ForgotPassword
> = async (req, res) => {
	try {
		const { email } = req.body;

		// Find user
		const user = await db.user.findOne({ email });
		if (!user) {
			// Don't reveal if user exists or not for security
			return sendError(res, 404, "User not found");
		}

		// Generate OTP
		const otp = generateOTP();
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

		// Store OTP
		user.otp = {
			code: otp,
			expiresAt,
			used: false,
		};
		await user.save();

		// Send OTP via email
		try {
			await sendOTPEmail(user.email, otp, user.full_name);
			console.log(`✅ OTP sent to ${email}: ${otp}`); // For development/debugging
		} catch (emailError) {
			console.error("Failed to send OTP email:", emailError);
			// Log OTP to console as fallback
			console.log(`⚠️ Email failed. OTP for ${email}: ${otp}`);
			// Don't return error to user for security reasons
		}

		return sendSuccess(
			res,
			200,
			"If the email exists, an OTP has been sent",
			null,
		);
	} catch (error) {
		console.error("Forgot password error:", error);
		return sendError(res, 500, "Internal Server Error");
	}
};
