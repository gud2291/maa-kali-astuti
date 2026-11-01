// Applies ./drizzle migrations to DATABASE_URL. Safe to run repeatedly (build + start both call it).
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    /* no .env.local; the check below reports the missing variable */
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("migrate: DATABASE_URL is not set");
  process.exit(1);
}

const LOCK_KEY = 7_265_002;
const pool = new Pool({ connectionString: url, max: 1 });

async function connectWithRetry(attempts = 20) {
  for (let i = 1; ; i++) {
    try {
      return await pool.connect();
    } catch (err) {
      if (i >= attempts) throw err;
      console.warn(`migrate: database not reachable (attempt ${i}/${attempts}), retrying in 3s…`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

const client = await connectWithRetry();
try {
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
  await migrate(drizzle({ client }), { migrationsFolder: "./drizzle" });
  console.info("migrate: up to date");
} catch (err) {
  console.error("migrate: failed", err);
  process.exitCode = 1;
} finally {
  try {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
  } catch {
    /* connection already gone */
  }
  client.release();
  await pool.end();
}
