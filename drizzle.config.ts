import { defineConfig } from "drizzle-kit";
if (!process.env.TURSO_DATABASE_URL) {
  try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: `db:generate` still works */ }
}
export default defineConfig({
  dialect: "turso",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.TURSO_DATABASE_URL ?? "", authToken: process.env.TURSO_AUTH_TOKEN },
});
