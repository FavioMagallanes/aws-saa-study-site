import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  WRITE_KEY: z.string().min(16, 'WRITE_KEY must be at least 16 characters'),
  PORT: z.coerce.number().int().positive().default(3001),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => envSchema.parse(source);
