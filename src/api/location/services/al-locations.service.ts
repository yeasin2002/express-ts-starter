import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { Request, RequestHandler, Response } from "express";

// Get all locations
export const getAllLocations: RequestHandler = async (
	_req: Request,
	res: Response,
) => {
	try {
		const locations = await db.location
			.find()
			.sort({ name: 1 })
			.select("-__v -createdAt -updatedAt");
		return sendSuccess(res, 200, "Locations fetched successfully", locations);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
