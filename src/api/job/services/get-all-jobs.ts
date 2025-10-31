import { db } from "@/db";
import {
	exceptionErrorHandler,
	sendSuccess,
	validatePagination,
} from "@/helpers";
import type { RequestHandler } from "express";
import type { SearchJob } from "../job.validation";

// Get All Jobs (with search and filters)
export const getAllJobs: RequestHandler<
	unknown,
	unknown,
	unknown,
	SearchJob
> = async (req, res) => {
	try {
		const {
			search,
			category,
			status,
			minBudget,
			maxBudget,
			location,
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

		// Search in title and description
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		// Filter by category
		if (category) {
			query.category = category;
		}

		// Filter by status
		if (status) {
			query.status = status;
		}

		// Filter by budget range
		if (minBudget || maxBudget) {
			query.budget = {};
			if (minBudget) query.budget.$gte = Number.parseInt(minBudget, 10);
			if (maxBudget) query.budget.$lte = Number.parseInt(maxBudget, 10);
		}

		// Filter by location
		if (location) {
			query.location = location;
		}

		// Get jobs with pagination
		const [jobs, total] = await Promise.all([
			db.job
				.find(query)
				.populate("category", "name icon")
				.populate("customerId", "name email")
				.populate("location", "name state coordinates")
				.skip(skip)
				.limit(limitNum)
				.sort({ createdAt: -1 }),
			db.job.countDocuments(query),
		]);

		// If user is authenticated and is a contractor, check which jobs they've applied to
		let jobsWithApplicationStatus: any[];
		if (req.user?.role === "contractor") {
			const contractorId = req.user.userId;
			const jobIds = jobs.map((job) => job._id);

			// Get all applications by this contractor for these jobs
			const applications = await db.jobApplicationRequest.find({
				job: { $in: jobIds },
				contractor: contractorId,
			});

			// Create a Set of job IDs the contractor has applied to
			const appliedJobIds = new Set(
				applications.map((app) => app.job.toString()),
			);

			// Add isApplied field to each job
			jobsWithApplicationStatus = jobs.map((job) => {
				const jobObj = job.toObject();
				return {
					...jobObj,
					isApplied: appliedJobIds.has((job._id as any).toString()),
				};
			});
		} else {
			// For non-contractors, add isApplied: false to all jobs
			jobsWithApplicationStatus = jobs.map((job) => ({
				...job.toObject(),
				isApplied: false,
			}));
		}

		const totalPages = Math.ceil(total / limitNum);

		return sendSuccess(res, 200, "Jobs retrieved successfully", {
			jobs: jobsWithApplicationStatus,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
		});
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to retrieve jobs");
	}
};
