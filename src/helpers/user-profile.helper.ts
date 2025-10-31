import { db } from "@/db";
import type { Types } from "mongoose";
import { getReviewStatsWithReviews } from "./review-stats.helper";

export interface UserProfileData {
  _id: Types.ObjectId;
  role: string;
  full_name: string;
  profile_img: string;
  cover_img: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  description: string;
  location?: any[];
  availability?: Date;
  is_verified: boolean;
  isSuspend: boolean;
  category: any[];
  skills?: string[];
  experience?: any[];
  work_samples?: any[];
  certifications?: any[];
  starting_budget?: number;
  hourly_charge?: number;
  createdAt?: Date;
  updatedAt?: Date;
  review?: {
    total: number;
    average: number;
    ratingDistribution: Record<number, number>;
    reviews: any[];
  };
  total_jobs?: number;
}

/**
 * Fetch user profile with populated fields, review stats, and job count
 * @param userId - The user's ID
 * @param includeReviews - Number of recent reviews to include (default: 5, set to 0 to skip)
 * @returns User profile data with all populated fields
 */
export const getUserProfile = async (
  userId: string | Types.ObjectId,
  includeReviews: number = 5
): Promise<UserProfileData | null> => {
  // Fetch user with populated fields
  const user = await db.user
    .findById(userId)
    .select("-password -refreshTokens -otp")
    .populate("category", "name icon description")
    .populate("location", "name state coordinates")
    .populate("experience")
    .populate("work_samples")
    .populate("certifications")
    .lean();

  if (!user) {
    return null;
  }

  // Prepare result object
  const userProfile: any = { ...user };

  // Remove the review array reference from user object
  delete userProfile.review;

  // For contractors, fetch review stats and job count in parallel
  if (user.role === "contractor") {
    const [reviewStats, jobStats] = await Promise.all([
      includeReviews > 0
        ? getReviewStatsWithReviews(userId, includeReviews)
        : null,
      // Aggregate job count for this contractor
      db.job.aggregate([
        {
          $match: {
            customerId: userId,
          },
        },
        {
          $group: {
            _id: null,
            total_jobs: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Add review stats if requested
    if (reviewStats) {
      userProfile.review = reviewStats;
    }

    // Add job count
    userProfile.total_jobs = jobStats[0]?.total_jobs || 0;
  } else {
    // For customers, just get their job count
    const jobStats = await db.job.aggregate([
      {
        $match: {
          customerId: userId,
        },
      },
      {
        $group: {
          _id: null,
          total_jobs: { $sum: 1 },
        },
      },
    ]);

    userProfile.total_jobs = jobStats[0]?.total_jobs || 0;
  }

  return userProfile as UserProfileData;
};
