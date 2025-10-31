import type { SuspendUser } from "@/api/admin/admin-user/admin-user.validation";
import { db } from "@/db";
import type { RequestHandler } from "express";

// suspend or unsuspend user
export const suspendUser: RequestHandler<
	{ id: string },
	any,
	SuspendUser
> = async (req, res) => {
	try {
		const { id } = req.params;
		const { suspend, reason } = req.body;

		const user = await db.user.findById(id);

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: "User not found",
				data: null,
			});
		}

		// Update user suspension status
		// Note: You may want to add a 'suspended' field to your user model
		// For now, we'll use a workaround with the existing fields
		const updateData: any = {};

		if (suspend) {
			// Mark as suspended (you might want to add a 'suspended' boolean field to the model)
			updateData.is_verified = false;
			console.log(
				`User ${user.full_name} suspended. Reason: ${
					reason || "No reason provided"
				}`,
			);
		} else {
			// Unsuspend user
			updateData.is_verified = true;
			console.log(`User ${user.full_name} unsuspended`);
		}

		await db.user.findByIdAndUpdate(id, updateData);

		res.status(200).json({
			status: 200,
			message: suspend
				? "User suspended successfully"
				: "User unsuspended successfully",
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
