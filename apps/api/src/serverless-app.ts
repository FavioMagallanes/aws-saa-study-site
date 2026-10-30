import { createApp } from './app/app.ts';
import { loadEnv } from './config/env.ts';
import { createDatabase } from './shared/db/client.ts';

// Each Vercel instance serves many requests (Fluid compute), so one small pool is shared by all.
const SERVERLESS_MAX_CONNECTIONS = 1;

export const createServerlessApp = (source: NodeJS.ProcessEnv = process.env) => {
  const env = loadEnv(source);
  const { db } = createDatabase(env.DATABASE_URL, {
    maxConnections: env.DATABASE_POOL_MAX ?? SERVERLESS_MAX_CONNECTIONS,
  });
  return createApp({ db, neonAuthJwksUrl: env.NEON_AUTH_JWKS_URL });
};
