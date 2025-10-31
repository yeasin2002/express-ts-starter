import { Schema, Types, model, type Document } from "mongoose";

export interface Certification {
	user: Types.ObjectId; // Reference to the user who owns this certification
	title: string;
	img: string;
	description?: string;
	issue_date?: Date; // When the certification was issued
	expiry_date?: Date; // When it expires (if applicable)
	issuing_organization?: string; // Who issued the certification
}

export interface CertificationDocument extends Certification, Document {}

const certificationSchema = new Schema<CertificationDocument>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true, // Index for faster queries
		},
		title: { type: String, required: true },
		img: { type: String, required: true },
		description: { type: String },
		issue_date: { type: Date },
		expiry_date: { type: Date },
		issuing_organization: { type: String },
	},
	{ timestamps: true },
);

// Index for querying user's certifications
certificationSchema.index({ user: 1, createdAt: -1 });

export const Certification = model<CertificationDocument>(
	"Certification",
	certificationSchema,
);
