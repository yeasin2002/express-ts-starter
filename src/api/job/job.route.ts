import "./job.openapi";

import {
	optionalAuth,
	requireAuth,
	requireRole,
} from "@/middleware/auth.middleware";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	CreateJobSchema,
	JobIdSchema,
	SearchJobSchema,
	UpdateJobSchema,
} from "./job.validation";
import {
	createJob,
	deleteJob,
	getAllJobs,
	getJobById,
	getMyJobs,
	updateJob,
} from "./services";

export const job: Router = express.Router();

// Public routes (with optional auth for personalized results)
job.get("/", optionalAuth, validateQuery(SearchJobSchema), getAllJobs);
job.get("/:id", validateParams(JobIdSchema), getJobById);

// Customer routes (authenticated)
job.get(
	"/my/jobs",
	requireAuth,
	requireRole("customer"),
	validateQuery(SearchJobSchema),
	getMyJobs,
);
job.post(
	"/",
	requireAuth,
	requireRole("customer"),
	validateBody(CreateJobSchema),
	createJob,
);

// Owner or Admin routes
job.put(
	"/:id",
	requireAuth,
	validateParams(JobIdSchema),
	validateBody(UpdateJobSchema),
	updateJob,
);
job.delete("/:id", requireAuth, validateParams(JobIdSchema), deleteJob);
