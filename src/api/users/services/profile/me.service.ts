import { getUserProfile, sendError, sendSuccess } from "@/helpers";
import type { RequestHandler } from "express";

// Get Current User (Me) Handler
export const me: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const userProfile = await getUserProfile(userId, 5);

    if (!userProfile) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "User retrieved successfully", userProfile);
  } catch (error) {
    console.error("Get user error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};
