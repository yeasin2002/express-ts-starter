import "./category.openapi";

import { upload } from "@/lib/multer";
import { requireAuth, requireRole } from "@/middleware/auth.middleware";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
} from "./category.service";
import {
	CategoryIdSchema,
	CreateCategorySchema,
	SearchCategorySchema,
	UpdateCategorySchema,
} from "./category.validation";

export const category: Router = express.Router();

// Public routes (anyone can access)
category.get("/", validateQuery(SearchCategorySchema), getAllCategories);
category.get("/:id", validateParams(CategoryIdSchema), getCategoryById);

// Admin routes (protected)
// Note: multer processes multipart/form-data, so validateBody runs after file upload
category.post(
	"/",
	requireAuth,
	requireRole("admin"),
	upload.single("icon"),
	validateBody(CreateCategorySchema),
	createCategory,
);
category.put(
	"/:id",
	requireAuth,
	validateParams(CategoryIdSchema),
	requireRole("admin"),
	upload.single("icon"),
	validateBody(UpdateCategorySchema),
	updateCategory,
);
category.delete(
	"/:id",
	requireAuth,
	requireRole("admin"),
	validateParams(CategoryIdSchema),
	deleteCategory,
);
