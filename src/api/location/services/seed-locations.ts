import { top50USCities } from "@/data/location-list";
import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers/response-handler";
import type { RequestHandler } from "express";

// Seed locations with top 50 US cities
export const seedLocations: RequestHandler = async (_req, res) => {
	try {
		// Check if locations already exist
		const existingCount = await db.location.countDocuments();
		if (existingCount > 0) {
			return sendError(
				res,
				400,
				`Database already contains ${existingCount} locations. Clear the collection first if you want to reseed.`,
			);
		}

		// Insert all cities
		const locations = await db.location.insertMany(top50USCities);

		return sendSuccess(
			res,
			201,
			`Successfully seeded ${locations.length} locations`,
			locations,
		);
	} catch (error) {
		console.log(error);
		return sendError(res, 500, "Internal Server Error");
	}
};
