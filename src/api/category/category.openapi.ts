import { mediaTypeFormat, openAPITags } from "@/common/constants";

import { registry } from "@/lib/openapi";
import {
	CategoriesResponseSchema,
	CategoryIdSchema,
	CategoryResponseSchema,
	CreateCategorySchema,
	ErrorResponseSchema,
	SearchCategorySchema,
	SuccessResponseSchema,
	UpdateCategorySchema,
} from "./category.validation";

// Register schemas
registry.register("CreateCategory", CreateCategorySchema);
registry.register("UpdateCategory", UpdateCategorySchema);
registry.register("CategoryIdParam", CategoryIdSchema);
registry.register("SearchCategory", SearchCategorySchema);
registry.register("CategoryResponse", CategoryResponseSchema);
registry.register("CategoriesResponse", CategoriesResponseSchema);
registry.register("SuccessResponse", SuccessResponseSchema);
registry.register("ErrorResponse", ErrorResponseSchema);

// GET /api/category - Get all categories with search
registry.registerPath({
	method: "get",
	path: openAPITags.category.basepath,
	description: "Get all categories with optional search and pagination",
	summary: "Get all categories",
	tags: [openAPITags.category.name],
	request: {
		query: SearchCategorySchema,
	},
	responses: {
		200: {
			description: "Categories retrieved successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: CategoriesResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// GET /api/category/:id - Get category by ID
registry.registerPath({
	method: "get",
	path: `${openAPITags.category.basepath}/{id}`,
	description: "Get a single category by ID",
	summary: "Get category by ID",
	tags: [openAPITags.category.name],
	request: {
		params: CategoryIdSchema,
	},
	responses: {
		200: {
			description: "Category retrieved successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: CategoryResponseSchema,
				},
			},
		},
		404: {
			description: "Category not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// POST /api/category - Create category (Admin only)
registry.registerPath({
	method: "post",
	path: openAPITags.category.basepath,
	description: "Create a new category (Admin only)",
	summary: "Create category",
	tags: [openAPITags.category.name],
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				[mediaTypeFormat.form]: {
					schema: CreateCategorySchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Category created successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: CategoryResponseSchema,
				},
			},
		},
		400: {
			description: "Validation error or category already exists",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - Admin only",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// PUT /api/category/:id - Update category (Admin only)
registry.registerPath({
	method: "put",
	path: `${openAPITags.category.basepath}/{id}`,
	description: "Update a category (Admin only)",
	summary: "Update category",
	tags: [openAPITags.category.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: CategoryIdSchema,
		body: {
			content: {
				[mediaTypeFormat.form]: {
					schema: UpdateCategorySchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Category updated successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: CategoryResponseSchema,
				},
			},
		},
		400: {
			description: "Validation error or category name already exists",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - Admin only",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Category not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});

// DELETE /api/category/:id - Delete category (Admin only)
registry.registerPath({
	method: "delete",
	path: `${openAPITags.category.basepath}/{id}`,
	description: "Delete a category (Admin only)",
	summary: "Delete category",
	tags: [openAPITags.category.name],
	security: [{ bearerAuth: [] }],
	request: {
		params: CategoryIdSchema,
	},
	responses: {
		200: {
			description: "Category deleted successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: SuccessResponseSchema,
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		403: {
			description: "Forbidden - Admin only",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		404: {
			description: "Category not found",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});
