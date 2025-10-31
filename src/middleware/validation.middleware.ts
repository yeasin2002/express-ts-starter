import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * Format Zod validation errors into a user-friendly format
 */
function formatZodErrors(error: z.ZodError): {
	message: string;
	errors: Array<{ field: string; message: string }>;
} {
	const errors = error.issues.map((issue) => ({
		field: issue.path.join(".") || "unknown",
		message: issue.message,
	}));

	// Create a summary message listing all required fields
	const requiredFields = errors
		.filter((err) => err.message.toLowerCase().includes("required"))
		.map((err) => err.field);

	let message = "Validation failed";

	if (requiredFields.length > 0) {
		message = `${requiredFields.join(" and ")} is required`;
	} else if (errors.length === 1) {
		message = errors[0].message;
	} else if (errors.length > 1) {
		message = `${errors.length} validation errors occurred`;
	}

	return { message, errors };
}

/**
 * Validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const { message, errors } = formatZodErrors(error);
				return res.status(400).json({
					success: false,
					message,
					errors,
				});
			}
			next(error);
		}
	};
};

/**
 * Validate request params against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.params);
			req.params = validatedData as any;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const { message, errors } = formatZodErrors(error);
				return res.status(400).json({
					success: false,
					message,
					errors,
				});
			}
			next(error);
		}
	};
};

/**
 * Validate request query against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.query);
			// In Express 5, req.query is read-only, so we use Object.assign
			Object.assign(req.query, validatedData);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const { message, errors } = formatZodErrors(error);
				return res.status(400).json({
					success: false,
					message,
					errors,
				});
			}
			next(error);
		}
	};
};

/**
 * Validate multiple parts of the request (body, params, query)
 * @param schemas - Object containing schemas for body, params, and/or query
 */
export const validate = (schemas: {
	body?: z.ZodSchema;
	params?: z.ZodSchema;
	query?: z.ZodSchema;
}) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const allErrors: Array<{ field: string; message: string }> = [];

			// Validate body
			if (schemas.body) {
				try {
					const validatedBody = schemas.body.parse(req.body);
					req.body = validatedBody;
				} catch (error) {
					if (error instanceof z.ZodError) {
						const { errors } = formatZodErrors(error);
						allErrors.push(
							...errors.map((e) => ({ ...e, field: `body.${e.field}` })),
						);
					}
				}
			}

			// Validate params
			if (schemas.params) {
				try {
					const validatedParams = schemas.params.parse(req.params);
					req.params = validatedParams as any;
				} catch (error) {
					if (error instanceof z.ZodError) {
						const { errors } = formatZodErrors(error);
						allErrors.push(
							...errors.map((e) => ({ ...e, field: `params.${e.field}` })),
						);
					}
				}
			}

			// Validate query
			if (schemas.query) {
				try {
					const validatedQuery = schemas.query.parse(req.query);
					// In Express 5, req.query is read-only, so we use Object.assign
					Object.assign(req.query, validatedQuery);
				} catch (error) {
					if (error instanceof z.ZodError) {
						const { errors } = formatZodErrors(error);
						allErrors.push(
							...errors.map((e) => ({ ...e, field: `query.${e.field}` })),
						);
					}
				}
			}

			// If there are any errors, return them
			if (allErrors.length > 0) {
				const message =
					allErrors.length === 1
						? allErrors[0].message
						: `${allErrors.length} validation errors occurred`;

				return res.status(400).json({
					success: false,
					message,
					errors: allErrors,
				});
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
