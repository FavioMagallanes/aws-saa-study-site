import { describe, expect, it } from 'vitest';
import { loadDatabaseEnv, loadEnv } from '../src/config/env.ts';

const BASE = {
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/arquitecto',
  WRITE_KEY: 'test-write-key-0123456789',
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
});

describe('loadDatabaseEnv', () => {
  it('needs only DATABASE_URL, so migrations run without the write key', () => {
    expect(loadDatabaseEnv({ DATABASE_URL: BASE.DATABASE_URL })).toEqual({
      DATABASE_URL: BASE.DATABASE_URL,
    });
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => loadDatabaseEnv({})).toThrow();
  });
});
