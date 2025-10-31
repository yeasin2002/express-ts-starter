import { db } from "@/db";
import { exceptionErrorHandler, sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";
import type { CreateReview } from "../review.validation";

/**
 * Create a new review
 * POST /api/review
 */
export const createReview: RequestHandler<{}, unknown, CreateReview> = async (
	req,
	res,
) => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			return sendError(res, 401, "Unauthorized");
		}

		const { contractor_id, job_id, rating, rating_message } = req.body;

		// Check if contractor exists and is actually a contractor
		const contractor = await db.user.findById(contractor_id);
		if (!contractor) {
			return sendError(res, 404, "Contractor not found");
		}

		if (contractor.role !== "contractor") {
			return sendError(res, 400, "User is not a contractor");
		}

		// Check if user is trying to review themselves
		if (contractor_id === userId) {
			return sendError(res, 400, "You cannot review yourself");
		}

		// If job_id is provided, verify it exists
		if (job_id) {
			const job = await db.job.findById(job_id);
			if (!job) {
				return sendError(res, 404, "Job not found");
			}

			// Check if user already reviewed this contractor for this job
			const existingReview = await db.review.findOne({
				user_id: userId,
				contractor_id,
				job_id,
			});

			if (existingReview) {
				return sendError(
					res,
					400,
					"You have already reviewed this contractor for this job",
				);
			}
		}

		// Create review
		const review = await db.review.create({
			contractor_id,
			user_id: userId,
			job_id,
			rating,
			rating_message,
		});

		// Populate the review
		const populatedReview = await db.review
			.findById(review._id)
			.populate("contractor_id", "full_name profile_img email role")
			.populate("user_id", "full_name profile_img email")
			.populate("job_id", "title budget status");

		return sendSuccess(
			res,
			201,
			"Review created successfully",
			populatedReview,
		);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to create review");
	}
};
