import { Schema, model, type Document } from "mongoose";

export interface Category {
	name: string;
	description: string;
	icon: string;
}

export interface CategoryDocument extends Category, Document {}

const CategorySchema = new Schema<CategoryDocument>(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			toLowerCase: true,
			trim: true,
		},
		description: {
			type: String,
			required: false,
			trim: true,
		},
		icon: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

export const Category = model<CategoryDocument>("Category", CategorySchema);
