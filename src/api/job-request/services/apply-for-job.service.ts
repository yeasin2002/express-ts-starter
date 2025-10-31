import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

/**
 * Contractor applies for a job
 * POST /api/job-request/apply/:jobId
 */
export const applyForJob: RequestHandler = async (req, res) => {
	try {
		const jobId = req.params.jobId;
		const contractorId = req.user?.userId;
		const { message } = req.body;

		if (!contractorId) {
			return sendError(res, 401, "Unauthorized");
		}

		// Check if job exists
		const job = await db.job.findById(jobId);
		if (!job) {
			return sendError(res, 404, "Job not found");
		}

		// Check if job is still open
		if (job.status !== "open") {
			return sendError(
				res,
				400,
				"This job is no longer accepting applications",
			);
		}

		// Check if contractor is trying to apply to their own job
		if (job.customerId.toString() === contractorId) {
			return sendError(res, 400, "You cannot apply to your own job");
		}

		// Check if already applied
		const existingApplication = await db.jobApplicationRequest.findOne({
			job: jobId,
			contractor: contractorId,
		});

		if (existingApplication) {
			return sendError(res, 400, "You have already applied to this job");
		}

		// Create application
		const application = await db.jobApplicationRequest.create({
			job: jobId,
			contractor: contractorId,
			message: message || "",
			status: "pending",
		});

		// Populate contractor details
		await application.populate("contractor", "full_name email profile_img");

		return sendSuccess(
			res,
			201,
			"Application submitted successfully",
			application,
		);
	} catch (error) {
		console.error("Job application error:", error);
		return sendError(res, 500, "Failed to submit application");
	}
};
