import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { createDatabase } from '../src/shared/db/client.ts';
import { TEST_DATABASE_URL } from './test-database.ts';

const databaseName = new URL(TEST_DATABASE_URL).pathname.slice(1);

export default async () => {
  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = '/postgres';
  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    databaseName,
  ]);
  if (existing.rowCount === 0) await admin.query(`CREATE DATABASE "${databaseName}"`);
  await admin.end();

  const { db, close } = createDatabase(TEST_DATABASE_URL);
  await migrate(db, { migrationsFolder: './migrations' });
  await close();
};
