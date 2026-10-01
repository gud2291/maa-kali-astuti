import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql/http";
import * as schema from "../../src/server/db/schema/index";

if (!process.env.TURSO_DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // .env.local may not exist; missing env error thrown below
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL. Please set it in .env.local or the environment.");
}

if (!authToken && !url.startsWith("file:")) {
  throw new Error("Missing TURSO_AUTH_TOKEN. Please set it in .env.local or the environment.");
}

const client = createClient({
  url,
  authToken,
});

export const db = drizzle({ client, schema });
export type Db = typeof db;
