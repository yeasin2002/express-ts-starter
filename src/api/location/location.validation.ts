import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Coordinates schema
const CoordinatesSchema = z.object({
	lat: z.number().openapi({ description: "Latitude" }),
	lng: z.number().openapi({ description: "Longitude" }),
});

// Base location schema
export const LocationSchema = z.object({
	_id: z.string().openapi({ description: "Location ID" }),
	name: z
		.string()
		.min(1, "Name is required")
		.openapi({ description: "City name" }),
	state: z
		.string()
		.min(1, "State is required")
		.openapi({ description: "State code" }),
	coordinates: CoordinatesSchema.openapi({
		description: "Geographic coordinates",
	}),
	createdAt: z.coerce
		.date()
		.optional()
		.openapi({ description: "Creation timestamp" }),
	updatedAt: z.coerce
		.date()
		.optional()
		.openapi({ description: "Last update timestamp" }),
});

// Schema for creating a location
export const CreateLocationSchema = LocationSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
}).openapi("CreateLocation");

// Schema for updating a location
export const UpdateLocationSchema = z
	.object({
		name: z.string().min(1, "Name is required").optional(),
		state: z.string().min(1, "State is required").optional(),
		coordinates: CoordinatesSchema.optional(),
	})
	.openapi("UpdateLocation");

// Schema for location ID parameter
export const LocationIdSchema = z
	.object({
		id: z
			.string()
			.min(1, "Location ID is required")
			.openapi({ description: "Location ID" }),
	})
	.openapi("LocationIdParam");

// Response schemas
export const LocationResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: LocationSchema.nullable(),
	})
	.openapi("LocationResponse");

export const LocationsResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		success: z.boolean(),
		data: z.array(LocationSchema),
	})
	.openapi("LocationsResponse");

export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null(),
		success: z.boolean(),
	})
	.openapi("ErrorResponse");

// Type exports
export type Location = z.infer<typeof LocationSchema>;
export type CreateLocation = z.infer<typeof CreateLocationSchema>;
export type UpdateLocation = z.infer<typeof UpdateLocationSchema>;
export type LocationResponse = z.infer<typeof LocationResponseSchema>;
export type LocationsResponse = z.infer<typeof LocationsResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
