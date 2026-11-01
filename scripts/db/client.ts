import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../src/server/db/schema/index";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // .env.local may not exist; missing env error thrown below
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL. Please set it in .env.local or the environment.");
}

const pool = new Pool({ connectionString, max: 4 });

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
export const closeDb = (): Promise<void> => pool.end();
