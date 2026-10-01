import "server-only";
import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql/http";
import { env } from "@/server/env";
import * as schema from "./schema";

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle({ client, schema });
export type Db = typeof db;
