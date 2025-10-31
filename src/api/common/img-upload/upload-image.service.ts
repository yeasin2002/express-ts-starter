import { sendError, sendSuccess } from "@/helpers";
import { getFileUrl } from "@/lib/multer";
import type { RequestHandler } from "express";

/**
 * Upload image handler
 * Accepts a single image file and returns the URL
 */
export const uploadImage: RequestHandler = async (req, res) => {
	try {
		if (!req.file) {
			return sendError(res, 400, "No image file provided");
		}

		// Get the base URL from environment or request
		const baseUrl =
			process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;

		// Get the file URL using helper function
		const relativeUrl = getFileUrl(req.file.filename);
		const imageUrl = `${baseUrl}${relativeUrl}`;

		return sendSuccess(res, 200, "Image uploaded successfully", {
			url: imageUrl,
			filename: req.file.filename,
			originalName: req.file.originalname,
			size: req.file.size,
			mimetype: req.file.mimetype,
		});
	} catch (error) {
		console.error("Image upload error:", error);
		return sendError(res, 500, "Failed to upload image");
	}
};
