import { db } from "@/db";
import type { RequestHandler } from "express";

// delete user account (hard delete)
export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
	try {
		const { id } = req.params;

		const user = await db.user.findByIdAndDelete(id);

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: "User not found",
				data: null,
			});
		}

		res.status(200).json({
			status: 200,
			message: "User account deleted successfully",
			data: null,
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
