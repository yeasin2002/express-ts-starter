import { logWarn } from "@/lib/logger";
import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	// Log 404 errors
	logWarn("Route Not Found", {
		route: req.originalUrl,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});

	res.status(404).json({
		status: 404,
		message: "Route not found",
		data: null,
	});
}
