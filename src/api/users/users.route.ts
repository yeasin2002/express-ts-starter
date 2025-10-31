import "./users.openapi";

import { requireAuth } from "@/middleware";
import {
  validateBody,
  validateParams,
} from "@/middleware/validation.middleware";
import express, { type Router } from "express";
import { getAllUsers } from "./services/get-all-users.service";
import { getSingleUser } from "./services/get-single-user";
import { updateProfile } from "./services/profile/edit-profile.service";
import { me } from "./services/profile/me.service";
import { UpdateProfileSchema, UserIdParamSchema } from "./users.validation";

export const users: Router = express.Router();


// Profiles
// GET /api/user/me - Get current authenticated user
users.get("/me", requireAuth, me);

// PATCH /api/user/me - Update current user profile
users.patch(
  "/me",
  requireAuth,
  validateBody(UpdateProfileSchema),
  updateProfile
);



// GET /api/user - Get all users with pagination
users.get("/", getAllUsers);

// GET /api/user/:id - Get single user by ID
users.get("/:id", validateParams(UserIdParamSchema), getSingleUser);