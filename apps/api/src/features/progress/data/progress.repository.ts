import { and, eq } from 'drizzle-orm';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import type { Database } from '../../../shared/db/client.ts';
import { readPages } from './progress.schema.ts';

const toEntry = (row: typeof readPages.$inferSelect): ProgressEntry => ({
  pageId: row.pageId,
  readAt: row.readAt.toISOString(),
});

export const createProgressRepository = (db: Database) => ({
  list: async (userId: string): Promise<ProgressEntry[]> => {
    const rows = await db
      .select()
      .from(readPages)
      .where(eq(readPages.userId, userId))
      .orderBy(readPages.readAt);
    return rows.map(toEntry);
  },
  markRead: async (userId: string, pageId: string): Promise<ProgressEntry> => {
    const [row] = await db
      .insert(readPages)
      .values({ userId, pageId })
      // A no-op update keeps the original read date and still returns the row.
      .onConflictDoUpdate({ target: [readPages.userId, readPages.pageId], set: { pageId } })
      .returning();
    if (!row) throw new Error('Insert returned no row');
    return toEntry(row);
  },
  markUnread: async (userId: string, pageId: string): Promise<void> => {
    await db
      .delete(readPages)
      .where(and(eq(readPages.userId, userId), eq(readPages.pageId, pageId)));
  },
});

export type ProgressRepository = ReturnType<typeof createProgressRepository>;
