import { db } from "@/db";
import {
	exceptionErrorHandler,
	sendBadRequest,
	sendForbidden,
	sendNotFound,
	sendSuccess,
} from "@/helpers";
import type { RequestHandler } from "express";
import type { UpdateJob } from "../job.validation";

// Update Job (Owner or Admin)
export const updateJob: RequestHandler<
	{ id: string },
	unknown,
	UpdateJob
> = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		const userId = req.user?.userId as string;
		const userRole = req.user?.role;

		// Check if job exists
		const job = await db.job.findById(id);
		if (!job) {
			return sendNotFound(res, "Job not found");
		}

		// Check ownership (customer can only update their own jobs, admin can update any)
		if (job.customerId.toString() !== userId && userRole !== "admin") {
			return sendForbidden(res, "You can only update your own jobs");
		}

		// If updating categories, validate they exist
		if (updates.category) {
			const categories = await db.category.find({
				_id: { $in: updates.category },
			});
			if (categories.length !== updates.category.length) {
				return sendBadRequest(res, "One or more categories not found");
			}
		}

		// If updating location, validate it exists
		if (updates.location) {
			const locationExists = await db.location.findById(updates.location);
			if (!locationExists) {
				return sendBadRequest(res, "Location not found");
			}
		}

		// Update job
		const updatedJob = await db.job
			.findByIdAndUpdate(id, updates, {
				new: true,
				runValidators: true,
			})
			.populate("category", "name icon")
			.populate("customerId", "name email")
			.populate("contractorId", "name email")
			.populate("location", "name state coordinates");

		return sendSuccess(res, 200, "Job updated successfully", updatedJob);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to update job");
	}
};
