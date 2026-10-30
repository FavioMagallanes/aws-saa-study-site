import { describe, expect, it } from 'vitest';
import { createPoolConfig } from '../src/shared/db/pool-config.ts';

const LOCAL_URL = 'postgres://postgres:postgres@localhost:5432/arquitecto';
const NEON_URL =
  'postgresql://user:secret@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

describe('createPoolConfig', () => {
  it('uses no SSL for a local connection string without sslmode', () => {
    expect(createPoolConfig(LOCAL_URL, { maxConnections: 10 })).toEqual({
      connectionString: LOCAL_URL,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 10_000,
    });
  });

  it('uses no SSL when the connection string says sslmode=disable', () => {
    const config = createPoolConfig(`${LOCAL_URL}?sslmode=disable`, { maxConnections: 10 });
    expect(config.ssl).toBe(false);
    expect(config.connectionString).toBe(LOCAL_URL);
  });

  it.each(['require', 'verify-ca', 'verify-full'])(
    'uses verified SSL when the connection string says sslmode=%s',
    (mode) => {
      const config = createPoolConfig(
        `postgresql://user:secret@db.example.com/app?sslmode=${mode}`,
        { maxConnections: 1 },
      );
      expect(config.ssl).toEqual({ rejectUnauthorized: true });
      expect(config.connectionString).toBe('postgresql://user:secret@db.example.com/app');
    },
  );

  it('keeps the other query parameters of a Neon pooled connection string', () => {
    expect(createPoolConfig(NEON_URL, { maxConnections: 1 })).toEqual({
      connectionString:
        'postgresql://user:secret@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech/neondb?channel_binding=require',
      ssl: { rejectUnauthorized: true },
      max: 1,
      idleTimeoutMillis: 10_000,
    });
  });

  it('rejects an sslmode that would silently skip certificate checks', () => {
    expect(() => createPoolConfig(`${LOCAL_URL}?sslmode=prefer`, { maxConnections: 1 })).toThrow(
      'Unsupported sslmode "prefer": use disable, require, verify-ca or verify-full',
    );
  });

  it('rejects a pool size below one', () => {
    expect(() => createPoolConfig(LOCAL_URL, { maxConnections: 0 })).toThrow(
      'maxConnections must be a positive integer',
    );
  });
});
