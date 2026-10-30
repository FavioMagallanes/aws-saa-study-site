import type { PoolConfig } from 'pg';

interface PoolOptions {
  readonly maxConnections: number;
}

const VERIFIED_SSL_MODES = new Set(['require', 'verify-ca', 'verify-full']);

const resolveSsl = (sslMode: string | null): PoolConfig['ssl'] => {
  if (sslMode === null || sslMode === 'disable') return false;
  // Node's TLS verifies the certificate chain and host name, the verify-full behavior pg uses today.
  if (VERIFIED_SSL_MODES.has(sslMode)) return { rejectUnauthorized: true };
  throw new Error(
    `Unsupported sslmode "${sslMode}": use disable, require, verify-ca or verify-full`,
  );
};

/**
 * Builds the pg pool settings from a connection string. The SSL decision is taken here from
 * `sslmode`, which is then removed from the string because pg would otherwise re-parse it and
 * override the explicit `ssl` option.
 */
export const createPoolConfig = (
  connectionString: string,
  { maxConnections }: PoolOptions,
): PoolConfig => {
  if (!Number.isInteger(maxConnections) || maxConnections < 1) {
    throw new Error('maxConnections must be a positive integer');
  }
  const url = new URL(connectionString);
  const ssl = resolveSsl(url.searchParams.get('sslmode'));
  url.searchParams.delete('sslmode');
  return {
    connectionString: url.toString(),
    ssl,
    max: maxConnections,
    idleTimeoutMillis: 10_000,
  };
};
