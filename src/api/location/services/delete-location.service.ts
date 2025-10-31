import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { RequestHandler } from "express";
// Delete location
export const deleteLocation: RequestHandler<{ id: string }> = async (
	req,
	res,
) => {
	try {
		const { id } = req.params;

		const location = await db.location.findByIdAndDelete(id);

		if (!location) {
			return sendError(res, 404, "Location not found");
		}

		return sendSuccess(res, 200, "Location deleted successfully", location);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
