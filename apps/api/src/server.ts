import { loadEnv } from './config/env.ts';
import { createApp } from './app/app.ts';
import { createDatabase } from './shared/db/client.ts';

const env = loadEnv();
const { db } = createDatabase(env.DATABASE_URL);
createApp({ db, writeKey: env.WRITE_KEY }).listen(env.PORT, () => {
  console.log(`API listening on :${String(env.PORT)}`);
});
