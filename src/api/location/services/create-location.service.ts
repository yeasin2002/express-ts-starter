import type { CreateLocation } from "@/api/location/location.validation";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { RequestHandler } from "express";

// Create location
export const createLocation: RequestHandler<{}, any, CreateLocation> = async (
	req,
	res,
) => {
	try {
		// Check if location already exists
		const existingLocation = await db.location.findOne({
			name: req.body.name,
			state: req.body.state,
		});

		if (existingLocation) {
			return sendError(res, 400, "Location already exists");
		}

		const location = await db.location.create(req.body);

		return sendSuccess(res, 201, "Location created successfully", location);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
