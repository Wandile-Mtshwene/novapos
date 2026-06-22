import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Required for Neon serverless in Node.js environments (not needed on Edge)
if (typeof WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

// Singleton pool: reused across hot reloads in development
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL! });
globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export type DB = typeof db;
