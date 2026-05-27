import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Shared connection pool for all server-side code. Keeps us under Supabase's
// session-mode pool_size limit (15) instead of each route opening its own pool.
export const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  prepare: false,
});
export const db = drizzle(sql, { schema });

export * from "./schema";
