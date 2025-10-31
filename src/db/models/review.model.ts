import { Schema, model, type Document, type Types } from "mongoose";

export interface Review {
	contractor_id: Types.ObjectId;
	user_id: Types.ObjectId;
	job_id?: Types.ObjectId;
	rating: number;
	rating_message: string;
}

export interface ReviewDocument extends Review, Document {}

const ReviewSchema = new Schema<ReviewDocument>(
	{
		contractor_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		user_id: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		job_id: {
			type: Schema.Types.ObjectId,
			ref: "Job",
		},
		rating: {
			type: Number,
			required: true,
			min: 0,
			max: 5,
		},
		rating_message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

export const Review = model<ReviewDocument>("Review", ReviewSchema);
