import { db } from "@/db";
import { exceptionErrorHandler, sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";
import type { UpdateReview } from "../review.validation";

/**
 * Update a review (only by the review author)
 * PUT /api/review/:id
 */
export const updateReview: RequestHandler<
	{ id: string },
	unknown,
	UpdateReview
> = async (req, res) => {
	try {
		const userId = req.user?.userId;
		const { id } = req.params;

		if (!userId) {
			return sendError(res, 401, "Unauthorized");
		}

		// Find the review
		const review = await db.review.findById(id);
		if (!review) {
			return sendError(res, 404, "Review not found");
		}

		// Check if user is the author of the review
		if (review.user_id.toString() !== userId) {
			return sendError(res, 403, "You can only update your own reviews");
		}

		// Update the review
		const updatedReview = await db.review
			.findByIdAndUpdate(
				id,
				{ $set: req.body },
				{ new: true, runValidators: true },
			)
			.populate("contractor_id", "full_name profile_img email role")
			.populate("user_id", "full_name profile_img email")
			.populate("job_id", "title budget status");

		return sendSuccess(res, 200, "Review updated successfully", updatedReview);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to update review");
	}
};
