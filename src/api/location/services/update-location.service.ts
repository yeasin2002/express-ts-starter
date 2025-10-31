import type { UpdateLocation } from "@/api/location/location.validation";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { RequestHandler } from "express";

// Update location
export const updateLocation: RequestHandler<
	{ id: string },
	any,
	UpdateLocation
> = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if location exists
		const existingLocation = await db.location.findById(id);
		if (!existingLocation) {
			return sendError(res, 404, "Location not found");
		}

		const location = await db.location.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		return sendSuccess(res, 200, "Location updated successfully", location);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
