import "./review.openapi";

import { requireAuth } from "@/middleware/auth.middleware";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	ContractorIdSchema,
	CreateReviewSchema,
	ReviewIdSchema,
	SearchReviewSchema,
	UpdateReviewSchema,
} from "./review.validation";
import {
	createReview,
	deleteReview,
	getAllReviews,
	getContractorReviews,
	getMyReviews,
	updateReview,
} from "./services";

export const review: Router = express.Router();

// Public routes
// GET /api/review - Get all reviews with filters
review.get("/", validateQuery(SearchReviewSchema), getAllReviews);

// GET /api/review/contractor/:contractorId - Get reviews for a specific contractor
review.get(
	"/contractor/:contractorId",
	validateParams(ContractorIdSchema),
	validateQuery(SearchReviewSchema),
	getContractorReviews,
);

// Protected routes (require authentication)
// GET /api/review/my - Get reviews written by authenticated user
review.get("/my", requireAuth, validateQuery(SearchReviewSchema), getMyReviews);

// POST /api/review - Create a new review
review.post("/", requireAuth, validateBody(CreateReviewSchema), createReview);

// PUT /api/review/:id - Update a review
review.put(
	"/:id",
	requireAuth,
	validateParams(ReviewIdSchema),
	validateBody(UpdateReviewSchema),
	updateReview,
);

// DELETE /api/review/:id - Delete a review
review.delete(
	"/:id",
	requireAuth,
	validateParams(ReviewIdSchema),
	deleteReview,
);
