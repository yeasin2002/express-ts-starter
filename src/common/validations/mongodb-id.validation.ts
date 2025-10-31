import { z } from "zod";
import { isValidObjectId } from "mongoose";

// MongoDB ObjectId validation helper
// export const isValidObjectId = (id: string): boolean => {
// 	return /^[a-f\d]{24}$/i.test(id);
// };

// Zod schema for MongoDB ObjectId
export const objectIdSchema = z.string().refine((val) => isValidObjectId(val), {
	message: "Invalid ObjectId format. Must be a 24 character hex string",
});
