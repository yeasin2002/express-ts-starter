import { db, examples } from "@/db";
import { dbErrorHandler, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

// Example: Get all examples from database
export const getAllExample: RequestHandler = async (_req, res) => {
	try {
		const result = await db.select().from(examples);
		return sendSuccess(res, 200, "Examples retrieved successfully", result);
	} catch (error) {
		return dbErrorHandler(error, res, "Failed to retrieve examples");
	}
};
