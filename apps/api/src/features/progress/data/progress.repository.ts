import { eq } from 'drizzle-orm';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import type { Database } from '../../../shared/db/client.ts';
import { readPages } from './progress.schema.ts';

export const createProgressRepository = (db: Database) => ({
  list: async (): Promise<ProgressEntry[]> => {
    const rows = await db.select().from(readPages).orderBy(readPages.readAt);
    return rows.map((row) => ({ pageId: row.pageId, readAt: row.readAt.toISOString() }));
  },
  markRead: async (pageId: string): Promise<ProgressEntry> => {
    const [row] = await db
      .insert(readPages)
      .values({ pageId })
      .onConflictDoUpdate({ target: readPages.pageId, set: { pageId } })
      .returning();
    if (!row) throw new Error('Insert returned no row');
    return { pageId: row.pageId, readAt: row.readAt.toISOString() };
  },
  markUnread: async (pageId: string): Promise<void> => {
    await db.delete(readPages).where(eq(readPages.pageId, pageId));
  },
});

export type ProgressRepository = ReturnType<typeof createProgressRepository>;
