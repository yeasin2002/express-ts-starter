import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

/**
 * Get all applications for a specific job (Customer only)
 * GET /api/job-request/job/:jobId
 */
export const getJobApplications: RequestHandler = async (req, res) => {
	try {
		const jobId = req.params.jobId;
		const userId = req.user?.userId;

		if (!userId) {
			return sendError(res, 401, "Unauthorized");
		}

		// Check if job exists and user is the owner
		const job = await db.job.findById(jobId);
		if (!job) {
			return sendError(res, 404, "Job not found");
		}

		if (job.customerId.toString() !== userId) {
			return sendError(
				res,
				403,
				"You can only view applications for your own jobs",
			);
		}

		// Get all applications for this job
		const applications = await db.jobApplicationRequest
			.find({ job: jobId })
			.populate("contractor", "full_name email profile_img phone skills")
			.sort({ createdAt: -1 });

		return sendSuccess(
			res,
			200,
			"Applications retrieved successfully",
			applications,
		);
	} catch (error) {
		console.error("Get job applications error:", error);
		return sendError(res, 500, "Failed to retrieve applications");
	}
};
