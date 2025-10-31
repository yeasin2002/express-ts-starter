import "./admin-user.openapi";

import {
	validateBody,
	validateParams,
	validateQuery,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";

import {
	SuspendUserSchema,
	UserIdParamSchema,
	UserQuerySchema,
} from "./admin-user.validation";
import { deleteUser, getAllUsers, getUserById, suspendUser } from "./services";

export const adminUser: Router = express.Router();

// User management routes
adminUser
	.get("/", validateQuery(UserQuerySchema), getAllUsers)
	.get("/:id", validateParams(UserIdParamSchema), getUserById)
	.delete("/:id", validateParams(UserIdParamSchema), deleteUser)
	.patch(
		"/:id/suspend",
		validateParams(UserIdParamSchema),
		validateBody(SuspendUserSchema),
		suspendUser,
	);
