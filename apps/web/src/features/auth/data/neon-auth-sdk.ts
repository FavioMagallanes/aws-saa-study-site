import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthVanillaAdapter } from '@neondatabase/auth/vanilla/adapters';

// Loaded on demand by auth-client.ts so the SDK stays out of the main bundle.
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

export const neonAuthClient = authUrl
  ? createAuthClient(authUrl, { adapter: BetterAuthVanillaAdapter() })
  : undefined;
