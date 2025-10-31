import { db } from "@/db";
import { exceptionErrorHandler, sendNotFound, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

// Get Job by ID
export const getJobById: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;

		const job = await db.job
			.findById(id)
			.populate("category", "name icon description")
			.populate("customerId", "name email phone")
			.populate("location", "name state coordinates");

		if (!job) {
			return sendNotFound(res, "Job not found");
		}

		return sendSuccess(res, 200, "Job retrieved successfully", job);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to retrieve job");
	}
};
