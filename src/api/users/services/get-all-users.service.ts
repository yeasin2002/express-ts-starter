import { getUsersService } from "@/common/service";
import { exceptionErrorHandler, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

// Get all users with search, filter, and pagination
export const getAllUsers: RequestHandler = async (req, res) => {
	try {
		const { search, role, location, category, page, limit, sortBy, sortOrder } =
			req.query as {
				search?: string;
				role?: "contractor" | "customer" | "admin";
				location?: string;
				category?: string;
				page?: number;
				limit?: number;
				sortBy?: string;
				sortOrder?: "asc" | "desc";
			};

		// Use common service to fetch users
		const result = await getUsersService({
			search,
			role,
			location,
			category,
			page,
			limit,
			sortBy,
			sortOrder,
		});

		return sendSuccess(res, 200, "Users fetched successfully", result);
	} catch (error) {
		return exceptionErrorHandler(error, res, "Failed to fetch users");
	}
};
