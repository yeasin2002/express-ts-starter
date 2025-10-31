import { db } from "@/db";
import type { Types } from "mongoose";

/**
 * Calculate review statistics for a contractor
 * @param contractorId - The contractor's ID
 * @returns Object with total reviews, average rating, and aggregated stats
 */
export const calculateReviewStats = async (
	contractorId: string | Types.ObjectId,
) => {
	const ratingAggregation = await db.review.aggregate([
		{ $match: { contractor_id: contractorId } },
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				average: { $avg: "$rating" },
				ratings: {
					$push: "$rating",
				},
			},
		},
		{
			$project: {
				_id: 0,
				total: 1,
				average: { $round: ["$average", 1] },
				ratings: 1,
			},
		},
	]);

	const stats = ratingAggregation[0] || { total: 0, average: 0, ratings: [] };

	// Calculate rating distribution
	const ratingDistribution = {
		5: 0,
		4: 0,
		3: 0,
		2: 0,
		1: 0,
	};

	if (stats.ratings && stats.ratings.length > 0) {
		for (const rating of stats.ratings) {
			const roundedRating = Math.round(rating);
			if (roundedRating >= 1 && roundedRating <= 5) {
				ratingDistribution[roundedRating as keyof typeof ratingDistribution]++;
			}
		}
	}

	return {
		total: stats.total,
		average: stats.average || 0,
		ratingDistribution,
	};
};

/**
 * Get review statistics with recent reviews
 * @param contractorId - The contractor's ID
 * @param limit - Number of recent reviews to fetch (default: 5)
 * @returns Object with stats and recent reviews
 */
export const getReviewStatsWithReviews = async (
	contractorId: string | Types.ObjectId,
	limit: number = 5,
) => {
	const [stats, recentReviews] = await Promise.all([
		calculateReviewStats(contractorId),
		db.review
			.find({ contractor_id: contractorId })
			.populate("user_id", "full_name profile_img email")
			.populate("job_id", "title budget status")
			.sort({ createdAt: -1 })
			.limit(limit),
	]);

	return {
		...stats,
		reviews: recentReviews,
	};
};
