import { db } from "@/db";
import { sendError, sendSuccess } from "@/helpers";
import { deleteFile, getFileUrl } from "@/lib/multer";
import type { RequestHandler } from "express";
import type {
	CreateCategory,
	SearchCategory,
	UpdateCategory,
} from "./category.validation";

// Get All Categories (with search and pagination)
export const getAllCategories: RequestHandler<
	unknown,
	unknown,
	unknown,
	SearchCategory
> = async (req, res) => {
	try {
		const { search, page = "1", limit = "10" } = req.query;

		const pageNum = Number.parseInt(page, 10);
		const limitNum = Number.parseInt(limit, 10);
		const skip = (pageNum - 1) * limitNum;

		// Build search query
		const query: { [key: string]: any } = {};
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		// Get categories with pagination
		const categories = await db.category
			.find(query)
			.skip(skip)
			.limit(limitNum)
			.sort({ name: 1 });

		const total = await db.category.countDocuments(query);

		const totalPages = Math.ceil(total / limitNum);

		return sendSuccess(
			res,
			200,
			search
				? `Found ${categories.length} categories matching "${search}"`
				: "Categories retrieved successfully",
			{
				categories,
				total,
				page: pageNum,
				limit: limitNum,
				totalPages,
			},
		);
	} catch (error) {
		console.error("Get categories error:", error);
		sendError(res, 500, "Internal Server Error");
	}
};

// Get Category by ID
export const getCategoryById: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await db.category
			.findById(id)
			.select("-description -createdAt -updatedAt __v");

		if (!category) {
			return sendError(res, 404, "Category not found");
		}

		sendSuccess(res, 200, "Category retrieved successfully", category);
	} catch (error) {
		console.error("Get category error:", error);
		sendError(res, 500, "Internal Server Error");
	}
};

// Create Category (Admin only)
export const createCategory: RequestHandler<
	unknown,
	unknown,
	CreateCategory
> = async (req, res) => {
	try {
		const { name, description } = req.body;
		const file = req.file;

		// Check if file was uploaded
		if (!file) {
			return sendError(res, 400, "Category icon image is required");
		}

		// Check if category with same name already exists
		const existingCategory = await db.category.findOne({
			name: { $regex: new RegExp(`^${name}$`, "i") },
		});

		if (existingCategory) {
			// Delete uploaded file if category already exists
			await deleteFile(file.filename);

			return sendError(res, 400, "Category with this name already exists");
		}

		// Get file URL
		const iconUrl = getFileUrl(file.filename);

		// Create category
		const category = await db.category.create({
			name,
			icon: iconUrl,
			description,
		});

		sendSuccess(res, 201, "Category created successfully", category);
	} catch (error) {
		console.error("Create category error:", error);

		// Delete uploaded file if error occurs
		if (req.file) {
			await deleteFile(req.file.filename);
		}

		sendError(res, 500, "Internal Server Error");
	}
};

// Update Category (Admin only)
export const updateCategory: RequestHandler<
	{ id: string },
	unknown,
	UpdateCategory
> = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		const file = req.file;

		// Check if category exists
		const category = await db.category.findById(id);
		if (!category) {
			// Delete uploaded file if category not found
			if (file) {
				await deleteFile(file.filename);
			}

			return sendError(res, 404, "Category not found");
		}

		// If updating name, check for duplicates
		if (updates.name) {
			const existingCategory = await db.category.findOne({
				name: { $regex: new RegExp(`^${updates.name}$`, "i") },
				_id: { $ne: id },
			});

			if (existingCategory) {
				// Delete uploaded file if duplicate name
				if (file) {
					await deleteFile(file.filename);
				}

				return sendError(res, 400, "Category with this name already exists");
			}
		}

		// Prepare update object
		const updateData: any = { ...updates };

		// If new icon uploaded, delete old icon and update with new one
		if (file) {
			// Extract filename from old icon URL
			const oldIconFilename = category.icon.split("/").pop();
			if (oldIconFilename) {
				await deleteFile(oldIconFilename);
			}

			// Add new icon URL to updates
			updateData.icon = getFileUrl(file.filename);
		}

		// Update category
		const updatedCategory = await db.category.findByIdAndUpdate(
			id,
			updateData,
			{
				new: true,
				runValidators: true,
			},
		);

		sendSuccess(res, 200, "Category updated successfully", updatedCategory);
	} catch (error) {
		console.error("Update category error:", error);

		// Delete uploaded file if error occurs
		if (req.file) {
			await deleteFile(req.file.filename);
		}

		sendError(res, 500, "Internal Server Error");
	}
};

// Delete Category (Admin only)
export const deleteCategory: RequestHandler = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await db.category.findByIdAndDelete(id);

		if (!category) {
			return sendError(res, 404, "Category not found");
		}

		// Delete icon file
		const iconFilename = category.icon.split("/").pop();
		if (iconFilename) {
			await deleteFile(iconFilename);
		}

		sendSuccess(res, 200, "Category deleted successfully", null);
	} catch (error) {
		console.error("Delete category error:", error);
		sendError(res, 500, "Internal Server Error");
	}
};
