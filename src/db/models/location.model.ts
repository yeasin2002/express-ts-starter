import { Schema, model, type Document } from "mongoose";

export interface Location {
	name: string;
	state: string;
	coordinates: { lat: number; lng: number };
}

export interface LocationDocument extends Location, Document {}

const locationSchema = new Schema<LocationDocument>(
	{
		name: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		coordinates: {
			lat: {
				type: Number,
				required: true,
			},
			lng: {
				type: Number,
				required: true,
			},
		},
	},
	{ timestamps: true },
);

export const Location = model<LocationDocument>("location", locationSchema);
