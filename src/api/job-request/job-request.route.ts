import "./job-request.openapi";

import { requireAuth, requireRole } from "@/middleware/auth.middleware";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import {
	ApplicationIdParamSchema,
	ApplyForJobSchema,
	JobIdParamSchema,
	SearchMyApplicationsSchema,
} from "./job-request.validation";
import {
	acceptApplication,
	applyForJob,
	cancelApplication,
	getJobApplications,
	getMyApplications,
	rejectApplication,
} from "./services";

export const jobRequest: Router = express.Router();

// Contractor routes
// Apply for a job
jobRequest.post(
	"/apply/:jobId",
	requireAuth,
	requireRole("contractor"),
	validateParams(JobIdParamSchema),
	validateBody(ApplyForJobSchema),
	applyForJob,
);

// Get contractor's own applications
jobRequest.get(
	"/my",
	requireAuth,
	requireRole("contractor"),
	validateQuery(SearchMyApplicationsSchema),
	getMyApplications,
);

// Cancel own application
jobRequest.delete(
	"/:applicationId",
	requireAuth,
	requireRole("contractor"),
	validateParams(ApplicationIdParamSchema),
	cancelApplication,
);

// Customer routes
// Get all applications for a specific job
jobRequest.get(
	"/job/:jobId",
	requireAuth,
	requireRole("customer"),
	validateParams(JobIdParamSchema),
	getJobApplications,
);

// Accept an application
jobRequest.patch(
	"/:applicationId/accept",
	requireAuth,
	requireRole("customer"),
	validateParams(ApplicationIdParamSchema),
	acceptApplication,
);

// Reject an application
jobRequest.patch(
	"/:applicationId/reject",
	requireAuth,
	requireRole("customer"),
	validateParams(ApplicationIdParamSchema),
	rejectApplication,
);
