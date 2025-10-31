import "./location.openapi";

import {
	validateBody,
	validateParams,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	CreateLocationSchema,
	LocationIdSchema,
	UpdateLocationSchema,
} from "./location.validation";
import {
	createLocation,
	deleteLocation,
	getAllLocations,
	getLocationById,
	seedLocations,
	updateLocation,
} from "./services";

export const location: Router = express.Router();

location
	.get("/", getAllLocations)
	.get("/:id", validateParams(LocationIdSchema), getLocationById)
	.post("/", validateBody(CreateLocationSchema), createLocation)
	.put(
		"/:id",
		validateParams(LocationIdSchema),
		validateBody(UpdateLocationSchema),
		updateLocation,
	)
	.delete("/:id", validateParams(LocationIdSchema), deleteLocation)
	.post("/seed", seedLocations);
