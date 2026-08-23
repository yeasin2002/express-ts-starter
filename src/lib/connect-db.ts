import { pool } from "@/db";
import chalk from "chalk";

export const connectDB = async () => {
	try {
		const client = await pool.connect();
		const res = await client.query("SELECT current_database()");
		client.release();
		const dbName = res.rows[0]?.current_database || "PostgreSQL";
		console.log(chalk.bgGreen.white(`PostgreSQL Connected: ${dbName}`));
	} catch (error: unknown) {
		console.error(
			chalk.bgRed.white(
				`PostgreSQL Connection Error: ${(error as Error).message}`,
			),
		);
	}
};
