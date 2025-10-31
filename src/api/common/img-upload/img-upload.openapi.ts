import { mediaTypeFormat, openAPITags } from "@/common/constants";
import { registry } from "@/lib/openapi";
import {
	ErrorResponseSchema,
	ImageUploadResponseSchema,
} from "./img-upload.validation";

// Register schemas
registry.register("ImageUploadResponse", ImageUploadResponseSchema);
registry.register("ImageUploadErrorResponse", ErrorResponseSchema);

// POST /api/upload - Upload image
registry.registerPath({
	method: "post",
	path: openAPITags.common.imag_upload.basepath,
	description: "Upload a single image file and get the URL",
	summary: "Upload images",
	tags: [openAPITags.common.imag_upload.name],
	requestBody: {
		required: true,
		content: {
			[mediaTypeFormat.form]: {
				schema: {
					type: "object",
					properties: {
						image: {
							type: "string",
							format: "binary",
							description: "Image file to upload (max 5MB)",
						},
					},
					required: ["image"],
				},
			},
		},
	},
	responses: {
		200: {
			description: "Image uploaded successfully",
			content: {
				[mediaTypeFormat.json]: {
					schema: ImageUploadResponseSchema,
				},
			},
		},
		400: {
			description: "No image file provided or invalid file type",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				[mediaTypeFormat.json]: {
					schema: ErrorResponseSchema,
				},
			},
		},
	},
});
