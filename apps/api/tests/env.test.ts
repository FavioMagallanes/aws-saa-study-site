import { describe, expect, it } from 'vitest';
import { loadDatabaseEnv, loadEnv } from '../src/config/env.ts';

const BASE = {
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/arquitecto',
  NEON_AUTH_JWKS_URL:
    'https://ep-bold-boat-b5jwy6jj.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json',
};

describe('loadEnv', () => {
  it('keeps the previous defaults and leaves the pool size unset', () => {
    expect(loadEnv(BASE)).toEqual({ ...BASE, PORT: 3001 });
  });

  it('reads DATABASE_POOL_MAX as a positive integer', () => {
    expect(loadEnv({ ...BASE, DATABASE_POOL_MAX: '3' }).DATABASE_POOL_MAX).toBe(3);
  });

  it('rejects a DATABASE_POOL_MAX below one', () => {
    expect(() => loadEnv({ ...BASE, DATABASE_POOL_MAX: '0' })).toThrow();
  });

  it('requires NEON_AUTH_JWKS_URL', () => {
    expect(() => loadEnv({ DATABASE_URL: BASE.DATABASE_URL })).toThrow('NEON_AUTH_JWKS_URL');
  });

  it('rejects a NEON_AUTH_JWKS_URL that is not a URL', () => {
    expect(() => loadEnv({ ...BASE, NEON_AUTH_JWKS_URL: 'jwks.json' })).toThrow(
      'NEON_AUTH_JWKS_URL',
    );
  });

  it('no longer reads WRITE_KEY', () => {
    expect(loadEnv({ ...BASE, WRITE_KEY: 'test-write-key-0123456789' })).toEqual({
      ...BASE,
      PORT: 3001,
    });
  });
});

describe('loadDatabaseEnv', () => {
  it('needs only DATABASE_URL, so migrations run without the auth settings', () => {
    expect(loadDatabaseEnv({ DATABASE_URL: BASE.DATABASE_URL })).toEqual({
      DATABASE_URL: BASE.DATABASE_URL,
    });
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => loadDatabaseEnv({})).toThrow();
  });
});
