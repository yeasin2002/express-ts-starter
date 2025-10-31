import { db } from "@/db";
import type { RequestHandler } from "express";

// get single user by id
export const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await db.user
			.findById(id)
			.select("-password -refreshTokens -otp")
			.populate("location", "name state coordinates")
			.populate("category", "name icon description")
			.populate("review");

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: "User not found",
				data: null,
			});
		}

		res.status(200).json({
			status: 200,
			message: "User fetched successfully",
			data: user,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 500,
			message: "Internal Server Error",
			data: null,
		});
	}
};
