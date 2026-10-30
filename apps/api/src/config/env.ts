import { z } from 'zod';

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const envSchema = databaseEnvSchema.extend({
  WRITE_KEY: z.string().min(16, 'WRITE_KEY must be at least 16 characters'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().optional(),
});

export type Env = z.infer<typeof envSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => envSchema.parse(source);

export const loadDatabaseEnv = (source: NodeJS.ProcessEnv = process.env): DatabaseEnv =>
  databaseEnvSchema.parse(source);
