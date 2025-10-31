import { db } from "@/db";
import { exceptionErrorHandler, sendBadRequest, sendCreated } from "@/helpers";
import type { RequestHandler } from "express";
import type { CreateJob } from "../job.validation";

// Create Job (Customer only)
export const createJob: RequestHandler<unknown, unknown, CreateJob> = async (
	req,
	res,
) => {
	try {
		const {
			title,
			category,
			description,
			location,
			address,
			budget,
			date,
			coverImg,
		} = req.body;

		// Get customer ID from authenticated user
		const customerId = req.user?.userId as string;

		// Validate categories exist
		const categories = await db.category.find({ _id: { $in: category } });
		if (categories.length !== category.length) {
			return sendBadRequest(res, "One or more categories not found");
		}

		// Validate location exists
		const locationExists = await db.location.findById(location);
		if (!locationExists) {
			return sendBadRequest(res, "Location not found");
		}

		// Create job
		const job = await db.job.create({
			title,
			category,
			description,
			location,
			address,
			budget,
			date,
			coverImg,
			customerId,
			status: "open",
		});

		// Populate and return
		const populatedJob = await db.job
			.findById(job._id)
			.populate("category", "name icon")
			.populate("customerId", "name email")
			.populate("location", "name state coordinates");

		return sendCreated(res, "Job created successfully", populatedJob);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to create job");
	}
};
