import type { Document, Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface JobApplicationRequest {
	job: Types.ObjectId;
	contractor: Types.ObjectId;
	status: "pending" | "accepted" | "rejected";
	message?: string;
}

export interface JobApplicationRequestDocument
	extends JobApplicationRequest,
		Document {}

export const JobApplicationRequestSchema =
	new Schema<JobApplicationRequestDocument>(
		{
			job: {
				type: Schema.Types.ObjectId,
				ref: "Job",
				required: true,
			},
			contractor: {
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			status: {
				type: String,
				enum: ["pending", "accepted", "rejected"],
				default: "pending",
			},
			message: {
				type: String,
				trim: true,
			},
		},
		{ timestamps: true },
	);

// Compound index to prevent duplicate applications
JobApplicationRequestSchema.index({ job: 1, contractor: 1 }, { unique: true });

export const JobApplicationRequest = model<JobApplicationRequestDocument>(
	"JobApplicationRequest",
	JobApplicationRequestSchema,
);
