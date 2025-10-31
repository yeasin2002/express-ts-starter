import { db } from "@/db";
import {
	exceptionErrorHandler,
	sendForbidden,
	sendNotFound,
	sendSuccess,
} from "@/helpers";
import type { RequestHandler } from "express";

// Delete Job (Owner or Admin)
export const deleteJob: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId as string;
		const userRole = req.user?.role;

		// Check if job exists
		const job = await db.job.findById(id);
		if (!job) {
			return sendNotFound(res, "Job not found");
		}

		// Check ownership
		if (job.customerId.toString() !== userId && userRole !== "admin") {
			return sendForbidden(res, "You can only delete your own jobs");
		}

		await db.job.findByIdAndDelete(id);

		return sendSuccess(res, 200, "Job deleted successfully", null);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to delete job");
	}
};
