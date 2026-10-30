import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createDatabase } from '../src/shared/db/client.ts';
import { TEST_DATABASE_URL } from './test-database.ts';

const MIGRATIONS_FOLDER = './migrations';
const FIRST_MIGRATION = '0000_nebulous_valeria_richards';

// A database of its own, so rebuilding it from nothing never touches the progress tests' data.
const migrationDatabaseUrl = new URL(TEST_DATABASE_URL);
migrationDatabaseUrl.pathname = '/arquitecto_migration_test';
const MIGRATION_DATABASE_URL = migrationDatabaseUrl.toString();

const journalSchema = z.object({
  entries: z.array(z.object({ tag: z.string(), when: z.number() })),
});

let client: Client;

const runMigrations = async () => {
  const { db, close } = createDatabase(MIGRATION_DATABASE_URL);
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await close();
  }
};

const columns = async () =>
  (
    await client.query<{ column_name: string; is_nullable: string }>(
      `SELECT column_name, is_nullable FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'read_pages' ORDER BY column_name`,
    )
  ).rows;

const primaryKey = async () =>
  (
    await client.query<{ column_name: string }>(
      `SELECT a.attname AS column_name
       FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       WHERE i.indrelid = 'public.read_pages'::regclass AND i.indisprimary
       ORDER BY array_position(i.indkey, a.attnum)`,
    )
  ).rows.map((row) => row.column_name);

const expectPerUserTable = async () => {
  expect(await columns()).toEqual([
    { column_name: 'page_id', is_nullable: 'NO' },
    { column_name: 'read_at', is_nullable: 'NO' },
    { column_name: 'user_id', is_nullable: 'NO' },
  ]);
  expect(await primaryKey()).toEqual(['user_id', 'page_id']);
  await client.query(
    `INSERT INTO read_pages (user_id, page_id) VALUES ('alice', 'amazon-s3'), ('bob', 'amazon-s3')`,
  );
  await expect(
    client.query(`INSERT INTO read_pages (user_id, page_id) VALUES ('alice', 'amazon-s3')`),
  ).rejects.toThrow('duplicate key');
};

beforeAll(async () => {
  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    'arquitecto_migration_test',
  ]);
  if (existing.rowCount === 0) await admin.query('CREATE DATABASE "arquitecto_migration_test"');
  await admin.end();
  client = new Client({ connectionString: MIGRATION_DATABASE_URL });
  await client.connect();
});

beforeEach(async () => {
  await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
  await client.query('DROP SCHEMA public CASCADE');
  await client.query('CREATE SCHEMA public');
});

afterAll(async () => {
  await client.end();
});

describe('Drizzle migrations', () => {
  it('build the per-user read_pages table on an empty database', async () => {
    await runMigrations();
    await expectPerUserTable();
  });

  it('apply on a database whose 0000 journal row was inserted by hand, as on Neon', async () => {
    const sql = await readFile(`${MIGRATIONS_FOLDER}/${FIRST_MIGRATION}.sql`, 'utf8');
    const journal = journalSchema.parse(
      JSON.parse(await readFile(`${MIGRATIONS_FOLDER}/meta/_journal.json`, 'utf8')),
    );
    const first = journal.entries.find((entry) => entry.tag === FIRST_MIGRATION);
    if (!first) throw new Error(`${FIRST_MIGRATION} is missing from the journal`);
    await client.query(sql);
    await client.query('CREATE SCHEMA drizzle');
    await client.query(
      'CREATE TABLE drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)',
    );
    await client.query(
      'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
      [createHash('sha256').update(sql).digest('hex'), first.when],
    );
    // Rows from the single-user era have no owner; the migration drops them.
    await client.query(`INSERT INTO read_pages (page_id) VALUES ('amazon-sqs')`);

    await runMigrations();

    await expectPerUserTable();
    const legacy = await client.query(`SELECT 1 FROM read_pages WHERE page_id = 'amazon-sqs'`);
    expect(legacy.rowCount).toBe(0);
    const applied = await client.query('SELECT 1 FROM drizzle.__drizzle_migrations');
    expect(applied.rowCount).toBe(journal.entries.length);
  });
});
