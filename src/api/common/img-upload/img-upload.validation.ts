import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Image upload response schema
export const ImageUploadResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.object({
			url: z
				.string()
				.openapi({ description: "Full URL of the uploaded image" }),
			filename: z.string().openapi({ description: "Generated filename" }),
			originalName: z.string().openapi({ description: "Original filename" }),
			size: z.number().openapi({ description: "File size in bytes" }),
			mimetype: z.string().openapi({ description: "MIME type of the image" }),
		}),
	})
	.openapi("ImageUploadResponse");

// Error response schema
export const ErrorResponseSchema = z
	.object({
		status: z.number(),
		message: z.string(),
		data: z.null(),
	})
	.openapi("ErrorResponse");

// Type exports
export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
