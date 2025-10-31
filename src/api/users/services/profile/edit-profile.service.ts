import { db } from "@/db";
import { getReviewStatsWithReviews, sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";
import type { UpdateProfile } from "../../users.validation";

/**
 * Update user profile
 * PATCH /api/user/me
 * Allows customers and contractors to update their profile information
 */
export const updateProfile: RequestHandler<{}, unknown, UpdateProfile> = async (
	req,
	res,
) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return sendError(res, 401, "Unauthorized");
		}

		// Get current user to check role
		const currentUser = await db.user.findById(userId);
		if (!currentUser) {
			return sendError(res, 404, "User not found");
		}

		const updateData = req.body;

		// Validate category and location IDs if provided
		if (updateData.category && updateData.category.length > 0) {
			const categories = await db.category.find({
				_id: { $in: updateData.category },
			});
			if (categories.length !== updateData.category.length) {
				return sendError(res, 400, "One or more categories not found");
			}
		}

		if (updateData.location && updateData.location.length > 0) {
			const locations = await db.location.find({
				_id: { $in: updateData.location },
			});
			if (locations.length !== updateData.location.length) {
				return sendError(res, 400, "One or more locations not found");
			}
		}

		// Contractor-specific field validation
		if (currentUser.role !== "contractor") {
			// Remove contractor-specific fields if user is not a contractor
			delete updateData.skills;
			delete updateData.experience;
			delete updateData.work_samples;
			delete updateData.starting_budget;
			delete updateData.certifications;
			delete updateData.hourly_charge;
			delete updateData.category;
		}

		// Update user profile
		const updatedUser = await db.user
			.findByIdAndUpdate(
				userId,
				{ $set: updateData },
				{ new: true, runValidators: true },
			)
			.select("-password -refreshTokens -otp")
			.populate("location", "name state coordinates")
			.populate("category", "name icon description")
			.populate("experience")
			.populate("work_samples")
			.populate("certifications");

		if (!updatedUser) {
			return sendError(res, 404, "User not found");
		}

		// Get review statistics for contractors
		let reviewStats = null;
		if (updatedUser.role === "contractor") {
			reviewStats = await getReviewStatsWithReviews(
				(updatedUser._id as any).toString(),
				5,
			);
		}

		// Convert user to plain object and add review stats
		const userObj: any = updatedUser.toObject();
		delete userObj.review; // Remove the review array reference

		return sendSuccess(res, 200, "Profile updated successfully", {
			...userObj,
			...(reviewStats && { review: reviewStats }),
		});
	} catch (error) {
		console.error("Update profile error:", error);
		return sendError(res, 500, "Failed to update profile");
	}
};
