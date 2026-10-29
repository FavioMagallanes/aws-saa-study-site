import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { loadEnv } from '../../config/env.ts';
import { createDatabase } from './client.ts';

const { db, close } = createDatabase(loadEnv().DATABASE_URL);
await migrate(db, { migrationsFolder: './migrations' });
await close();
