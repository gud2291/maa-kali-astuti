import { defineConfig } from "drizzle-kit";
if (!process.env.DATABASE_URL) {
  try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: `db:generate` still works */ }
}
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
