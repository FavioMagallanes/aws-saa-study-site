import express from 'express';
import helmet from 'helmet';
import { createAccessTokenVerifier } from '../shared/auth/access-token-verifier.ts';
import { requireUser } from '../shared/auth/require-user.ts';
import type { Database } from '../shared/db/client.ts';
import { createProgressRepository } from '../features/progress/data/progress.repository.ts';
import { createProgressRouter } from '../features/progress/http/progress.router.ts';

interface AppOptions {
  readonly db: Database;
  /** Where the Neon Auth signing keys are published (`<auth base URL>/.well-known/jwks.json`). */
  readonly neonAuthJwksUrl: string;
}

export const createApp = ({ db, neonAuthJwksUrl }: AppOptions) => {
  const app = express();
  app.use(helmet());
  const requireSignedInUser = requireUser(createAccessTokenVerifier(neonAuthJwksUrl));
  app.use('/api', createProgressRouter(createProgressRepository(db), requireSignedInUser));
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
