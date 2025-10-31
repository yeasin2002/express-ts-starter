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
 * Get all reviews for a specific contractor
 * GET /api/review/contractor/:contractorId
 */
export const getContractorReviews: RequestHandler<
	{ contractorId: string },
	unknown,
	unknown,
	SearchReview
> = async (req, res) => {
	try {
		const { contractorId } = req.params;
		const { minRating, maxRating, page, limit } = req.query;

		// Check if contractor exists
		const contractor = await db.user.findById(contractorId);
		if (!contractor) {
			return sendError(res, 404, "Contractor not found");
		}

		if (contractor.role !== "contractor") {
			return sendError(res, 400, "User is not a contractor");
		}

		// Validate and sanitize pagination
		const {
			page: pageNum,
			limit: limitNum,
			skip,
		} = validatePagination(page, limit);

		// Build query
		const query: any = { contractor_id: contractorId };

		// Filter by rating range
		if (minRating || maxRating) {
			query.rating = {};
			if (minRating) query.rating.$gte = Number.parseInt(minRating, 10);
			if (maxRating) query.rating.$lte = Number.parseInt(maxRating, 10);
		}

		// Get reviews with pagination
		const [reviews, total] = await Promise.all([
			db.review
				.find(query)
				.populate("user_id", "full_name profile_img email")
				.populate("job_id", "title budget status")
				.skip(skip)
				.limit(limitNum)
				.sort({ createdAt: -1 }),
			db.review.countDocuments(query),
		]);

		// Calculate review statistics
		const { calculateReviewStats } = await import("@/helpers");
		const stats = await calculateReviewStats(contractorId);

		const totalPages = Math.ceil(total / limitNum);

		return sendSuccess(res, 200, "Contractor reviews retrieved successfully", {
			reviews,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
			average: stats.average,
			ratingDistribution: stats.ratingDistribution,
		});
	} catch (error) {
		return exceptionErrorHandler(
			error,
			res,
			"Failed to retrieve contractor reviews",
		);
	}
};
