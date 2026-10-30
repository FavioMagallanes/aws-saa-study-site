import { Router, type RequestHandler } from 'express';
import { markReadParamsSchema } from '@arquitecto/contracts/progress';
import { authenticatedUserId } from '../../../shared/auth/require-user.ts';
import type { ProgressRepository } from '../data/progress.repository.ts';

export const createProgressRouter = (
  repository: ProgressRepository,
  requireUser: RequestHandler,
) => {
  const router = Router();
  router.use('/progress', requireUser);

  router.get('/progress', async (_req, res) => {
    res.json({ entries: await repository.list(authenticatedUserId(res)) });
  });

  router.put('/progress/:pageId', async (req, res) => {
    const params = markReadParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: 'invalid_page_id' });
      return;
    }
    res.json(await repository.markRead(authenticatedUserId(res), params.data.pageId));
  });

  router.delete('/progress/:pageId', async (req, res) => {
    const params = markReadParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: 'invalid_page_id' });
      return;
    }
    await repository.markUnread(authenticatedUserId(res), params.data.pageId);
    res.status(204).end();
  });

  return router;
};
