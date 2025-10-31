import {
  exceptionErrorHandler,
  getUserProfile,
  sendError,
  sendSuccess,
} from "@/helpers";
import type { RequestHandler } from "express";

/**
 * Get a single user by ID with full details
 * GET /api/user/:id
 */
export const getSingleUser: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const userProfile = await getUserProfile(id, 5);

    if (!userProfile) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", userProfile);
  } catch (error) {
    return exceptionErrorHandler(error, res, "Failed to retrieve user");
  }
};
