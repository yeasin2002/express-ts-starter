import { sendInternalError, sendUnauthorized } from "@/helpers";
import { verifyAccessToken } from "@/lib/jwt";
import type { NextFunction, Request, Response } from "express";

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				role: "customer" | "contractor" | "admin";
			};
		}
	}
}

/**
 * Middleware to verify JWT access token
 * Adds user data to req.user if token is valid
 */
export const requireAuth = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Get token from Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return sendUnauthorized(res, "Unauthorized - No token provided");
		}

		// Extract token
		const token = authHeader.substring(7);

		// Verify token
		try {
			const decoded = verifyAccessToken(token);

			// Add user data to request
			req.user = {
				userId: decoded.userId,
				email: decoded.email,
				role: decoded.role,
			};

			next();
			// oxlint-disable-next-line no-unused-vars
		} catch (_error) {
			return sendUnauthorized(res, "Unauthorized - Invalid or expired token");
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return sendInternalError(res, "Internal Server Error");
	}
};

/**
 * Middleware to check if user has required role
 * Must be used after requireAuth middleware
 * @param role - Required role (customer, contractor, or admin)
 */
export const requireRole = (role: "customer" | "contractor" | "admin") => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if user is authenticated
			if (!req.user) {
				return sendUnauthorized(res, "Unauthorized - Authentication required");
			}

			// Check if user has required role
			if (req.user.role !== role) {
				return sendUnauthorized(
					res,
					`Forbidden - ${
						role.charAt(0).toUpperCase() + role.slice(1)
					} access required`,
				);
			}

			next();
		} catch (error) {
			console.error("Role middleware error:", error);
			return sendInternalError(res, "Internal Server Error");
		}
	};
};

/**
 * Middleware to check if user has any of the specified roles
 * Must be used after requireAuth middleware
 * @param roles - Array of allowed roles
 */
export const requireAnyRole = (
	roles: Array<"customer" | "contractor" | "admin">,
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if user is authenticated
			if (!req.user) {
				return sendUnauthorized(res, "Unauthorized - Authentication required");
			}

			// Check if user has any of the required roles
			if (!roles.includes(req.user.role)) {
				return sendUnauthorized(res, "Forbidden - Insufficient permissions");
			}

			next();
		} catch (error) {
			console.error("Role middleware error:", error);
			return sendInternalError(res, "Internal Server Error");
		}
	};
};

/**
 * Middleware to check if user is accessing their own resource
 * Must be used after requireAuth middleware
 * @param userIdParam - Name of the route parameter containing user ID (default: "id")
 */
export const requireOwnership = (userIdParam: string = "id") => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Check if user is authenticated
			if (!req.user) {
				return sendUnauthorized(res, "Unauthorized - Authentication required");
			}

			// Get user ID from route params
			const resourceUserId = req.params[userIdParam];

			// Check if user is accessing their own resource or is admin
			if (req.user.userId !== resourceUserId && req.user.role !== "admin") {
				return sendUnauthorized(
					res,
					"Forbidden - You can only access your own resources",
				);
			}

			next();
		} catch (error) {
			console.error("Ownership middleware error:", error);
			return sendInternalError(res, "Internal Server Error");
		}
	};
};

/**
 * Optional auth middleware - adds user data if token is present but doesn't require it
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 */
export const optionalAuth = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7);

			try {
				const decoded = verifyAccessToken(token);
				req.user = {
					userId: decoded.userId,
					email: decoded.email,
					role: decoded.role,
				};
				// oxlint-disable-next-line no-unused-vars
			} catch (_error) {
				// Token invalid, but we don't fail - just continue without user
				console.log("Optional auth: Invalid token, continuing without user");
			}
		}

		next();
	} catch (error) {
		console.error("Optional auth middleware error:", error);
		next();
	}
};
