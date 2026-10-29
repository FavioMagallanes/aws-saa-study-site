import { Router } from 'express';
import { markReadParamsSchema } from '@arquitecto/contracts/progress';
import type { ProgressRepository } from '../data/progress.repository.ts';
import { requireWriteKey } from './require-write-key.ts';

export const createProgressRouter = (repository: ProgressRepository, writeKey: string) => {
  const router = Router();
  const guard = requireWriteKey(writeKey);

  router.get('/progress', async (_req, res) => {
    res.json({ entries: await repository.list() });
  });

  router.put('/progress/:pageId', guard, async (req, res) => {
    const params = markReadParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: 'invalid_page_id' });
      return;
    }
    res.json(await repository.markRead(params.data.pageId));
  });

  router.delete('/progress/:pageId', guard, async (req, res) => {
    const params = markReadParamsSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: 'invalid_page_id' });
      return;
    }
    await repository.markUnread(params.data.pageId);
    res.status(204).end();
  });

  return router;
};
