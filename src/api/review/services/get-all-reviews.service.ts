import { db } from "@/db";
import {
	exceptionErrorHandler,
	sendSuccess,
	validatePagination,
} from "@/helpers";
import type { RequestHandler } from "express";
import type { SearchReview } from "../review.validation";

/**
 * Get all reviews with filters and pagination
 * GET /api/review
 */
export const getAllReviews: RequestHandler<
	unknown,
	unknown,
	unknown,
	SearchReview
> = async (req, res) => {
	try {
		const {
			contractor_id,
			user_id,
			job_id,
			minRating,
			maxRating,
			page,
			limit,
		} = req.query;

		// Validate and sanitize pagination
		const {
			page: pageNum,
			limit: limitNum,
			skip,
		} = validatePagination(page, limit);

		// Build query
		const query: any = {};

		// Filter by contractor
		if (contractor_id) {
			query.contractor_id = contractor_id;
		}

		// Filter by user
		if (user_id) {
			query.user_id = user_id;
		}

		// Filter by job
		if (job_id) {
			query.job_id = job_id;
		}

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
				.populate("contractor_id", "full_name profile_img email role")
				.populate("user_id", "full_name profile_img email")
				.populate("job_id", "title budget status")
				.skip(skip)
				.limit(limitNum)
				.sort({ createdAt: -1 }),
			db.review.countDocuments(query),
		]);

		const totalPages = Math.ceil(total / limitNum);

		// Calculate statistics if filtering by contractor
		let stats = null;
		if (contractor_id) {
			const { calculateReviewStats } = await import("@/helpers");
			stats = await calculateReviewStats(contractor_id);
		}

		return sendSuccess(res, 200, "Reviews retrieved successfully", {
			reviews,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
			...(stats && {
				average: stats.average,
				ratingDistribution: stats.ratingDistribution,
			}),
		});
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to retrieve reviews");
	}
};
