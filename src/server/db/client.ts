import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/server/env";
import * as schema from "./schema";

/* One pool per server process; reused across hot reloads in dev. */
const globalForPool = globalThis as unknown as { __mkaPgPool?: Pool };

const pool =
  globalForPool.__mkaPgPool ??
  new Pool({ connectionString: env.DATABASE_URL, max: 10 });

if (env.NODE_ENV !== "production") globalForPool.__mkaPgPool = pool;

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
