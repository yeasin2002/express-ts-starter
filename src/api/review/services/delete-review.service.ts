import { db } from "@/db";
import { exceptionErrorHandler, sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

/**
 * Delete a review (only by the review author)
 * DELETE /api/review/:id
 */
export const deleteReview: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
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
			return sendError(res, 403, "You can only delete your own reviews");
		}

		// Delete the review
		await db.review.findByIdAndDelete(id);

		return sendSuccess(res, 200, "Review deleted successfully", null);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to delete review");
	}
};
