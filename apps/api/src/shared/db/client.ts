import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createPoolConfig } from './pool-config.ts';

interface DatabaseOptions {
  readonly maxConnections?: number;
}

// pg's own default; the long-running local server keeps it, the Vercel function asks for fewer.
const DEFAULT_MAX_CONNECTIONS = 10;

export const createDatabase = (
  connectionString: string,
  { maxConnections = DEFAULT_MAX_CONNECTIONS }: DatabaseOptions = {},
) => {
  const pool = new Pool(createPoolConfig(connectionString, { maxConnections }));
  return { db: drizzle({ client: pool }), close: () => pool.end() };
};

export type Database = ReturnType<typeof createDatabase>['db'];
