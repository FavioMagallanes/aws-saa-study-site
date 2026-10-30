import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { loadDatabaseEnv } from '../../config/env.ts';
import { createDatabase } from './client.ts';

const { db, close } = createDatabase(loadDatabaseEnv().DATABASE_URL);
await migrate(db, { migrationsFolder: './migrations' });
await close();
