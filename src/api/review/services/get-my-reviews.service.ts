import { db } from "@/db";
import {
	exceptionErrorHandler,
	sendError,
	sendSuccess,
	validatePagination,
} from "@/helpers";
import type { RequestHandler } from "express";
import type { SearchReview } from "../review.validation";

/**
 * Get reviews written by the authenticated user
 * GET /api/review/my
 */
export const getMyReviews: RequestHandler<
	unknown,
	unknown,
	unknown,
	SearchReview
> = async (req, res) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return sendError(res, 401, "Unauthorized");
		}

		const { page, limit } = req.query;

		// Validate and sanitize pagination
		const {
			page: pageNum,
			limit: limitNum,
			skip,
		} = validatePagination(page, limit);

		// Get reviews written by this user
		const [reviews, total] = await Promise.all([
			db.review
				.find({ user_id: userId })
				.populate("contractor_id", "full_name profile_img email role")
				.populate("job_id", "title budget status")
				.skip(skip)
				.limit(limitNum)
				.sort({ createdAt: -1 }),
			db.review.countDocuments({ user_id: userId }),
		]);

		const totalPages = Math.ceil(total / limitNum);

		return sendSuccess(res, 200, "Your reviews retrieved successfully", {
			reviews,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
		});
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to retrieve your reviews");
	}
};
