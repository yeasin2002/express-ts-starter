import { Schema, Types, model, type Document } from "mongoose";

export interface WorkSample {
	user: Types.ObjectId; // Reference to the user who owns this work sample
	name: string;
	img: string;
	description?: string;
}

export interface WorkSampleDocument extends WorkSample, Document {}

const workSampleSchema = new Schema<WorkSampleDocument>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true, // Index for faster queries
		},
		name: { type: String, required: true },
		img: { type: String, required: true },
		description: { type: String },
	},
	{ timestamps: true },
);

// Index for querying user's work samples
workSampleSchema.index({ user: 1, createdAt: -1 });

export const WorkSample = model<WorkSampleDocument>(
	"WorkSample",
	workSampleSchema,
);
