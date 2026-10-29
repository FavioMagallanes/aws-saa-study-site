import express from 'express';
import helmet from 'helmet';
import type { Database } from '../shared/db/client.ts';
import { createProgressRepository } from '../features/progress/data/progress.repository.ts';
import { createProgressRouter } from '../features/progress/http/progress.router.ts';

interface AppOptions {
  readonly db: Database;
  readonly writeKey: string;
}

export const createApp = ({ db, writeKey }: AppOptions) => {
  const app = express();
  app.use(helmet());
  app.use('/api', createProgressRouter(createProgressRepository(db), writeKey));
  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });
  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(error);
      res.status(500).json({ error: 'internal_error' });
    },
  );
  return app;
};
