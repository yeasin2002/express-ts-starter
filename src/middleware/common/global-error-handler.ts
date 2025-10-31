import { sendError } from "@/helpers/response-handler";
import { logError } from "@/lib/logger";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	const status = err.status || err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Log full error with stack and request info
	logError("Unhandled Error", err, {
		status,
		route: req.originalUrl,
		method: req.method,
		body: req.body,
		params: req.params,
		query: req.query,
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});

	// Return safe error to client
	return sendError(
		res,
		status,
		status === 500 ? "Internal Server Error" : message,
	);
};
