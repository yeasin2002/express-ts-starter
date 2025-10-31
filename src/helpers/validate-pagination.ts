/**
 * Validate and sanitize pagination parameters
 * @param page - Page number string
 * @param limit - Limit number string
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Object with validated page, limit, and skip values
 */
export const validatePagination = (
	page = "1",
	limit = "10",
	maxLimit = 100,
): { page: number; limit: number; skip: number } => {
	let pageNum = Number.parseInt(page, 10);
	let limitNum = Number.parseInt(limit, 10);

	// Validate and sanitize
	pageNum = Number.isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
	limitNum = Number.isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
	limitNum = limitNum > maxLimit ? maxLimit : limitNum;

	const skip = (pageNum - 1) * limitNum;

	return { page: pageNum, limit: limitNum, skip };
};
