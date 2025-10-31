import { db } from "@/db";
import { sendError, sendSuccess, validatePagination } from "@/helpers";
import type { RequestHandler } from "express";
import type { SearchMyApplications } from "../job-request.validation";

/**
 * Get contractor's own job applications with search and filters
 * GET /api/job-request/my
 */
export const getMyApplications: RequestHandler<
	unknown,
	unknown,
	unknown,
	SearchMyApplications
> = async (req, res) => {
	try {
		const contractorId = req.user?.userId;

		if (!contractorId) {
			return sendError(res, 401, "Unauthorized");
		}

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

		// Build base query - always filter by contractor
		const applicationQuery: any = { contractor: contractorId };

		// Filter by application status
		if (status) {
			applicationQuery.status = status;
		}

		// Get applications first
		const allApplications = await db.jobApplicationRequest
			.find(applicationQuery)
			.populate({
				path: "job",
				select:
					"title description budget status location category address customerId",
				populate: [
					{
						path: "customerId",
						select: "full_name email profile_img",
					},
					{
						path: "category",
						select: "name icon",
					},
					{
						path: "location",
						select: "name state coordinates",
					},
				],
			})
			.sort({ createdAt: -1 });

		// Filter applications based on job criteria
		let filteredApplications: any[] = allApplications.filter(
			(app) => app.job !== null,
		);

		// Search in job title and description
		if (search) {
			const searchLower = search.toLowerCase();
			filteredApplications = filteredApplications.filter((app: any) => {
				const job = app.job;
				return (
					job?.title?.toLowerCase().includes(searchLower) ||
					job?.description?.toLowerCase().includes(searchLower)
				);
			});
		}

		// Filter by category
		if (category) {
			filteredApplications = filteredApplications.filter((app: any) => {
				const job = app.job;
				return job?.category?.some(
					(cat: any) => cat._id.toString() === category,
				);
			});
		}

		// Filter by budget range
		if (minBudget || maxBudget) {
			filteredApplications = filteredApplications.filter((app: any) => {
				const job = app.job;
				const budget = job?.budget;
				if (!budget) return false;

				if (minBudget && budget < Number.parseInt(minBudget, 10)) return false;
				if (maxBudget && budget > Number.parseInt(maxBudget, 10)) return false;

				return true;
			});
		}

		// Filter by location
		if (location) {
			filteredApplications = filteredApplications.filter((app: any) => {
				const job = app.job;
				return job?.location?._id?.toString() === location;
			});
		}

		// Calculate pagination
		const total = filteredApplications.length;
		const totalPages = Math.ceil(total / limitNum);

		// Apply pagination
		const paginatedApplications = filteredApplications.slice(
			skip,
			skip + limitNum,
		);

		return sendSuccess(res, 200, "Your applications retrieved successfully", {
			applications: paginatedApplications,
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
		});
	} catch (error) {
		console.error("Get my applications error:", error);
		return sendError(res, 500, "Failed to retrieve your applications");
	}
};
