import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/node_express_db",
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export default db;
