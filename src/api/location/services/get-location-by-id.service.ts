import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { Request, RequestHandler, Response } from "express";

// get location by id
export const getLocationById: RequestHandler<{ id: string }> = async (
	req: Request,
	res: Response,
) => {
	try {
		const { id } = req.params;
		const location = await db.location
			.findById(id)
			.select("-__v -createdAt -updatedAt");

		if (!location) {
			return sendError(res, 404, "Location not found");
		}

		return sendSuccess(res, 200, "Location fetched successfully", location);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
