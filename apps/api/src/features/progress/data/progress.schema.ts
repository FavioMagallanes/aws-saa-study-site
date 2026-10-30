import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const readPages = pgTable(
  'read_pages',
  {
    // The Neon Auth user id (the access token's `sub`, `neon_auth.user.id`).
    userId: text('user_id').notNull(),
    pageId: text('page_id').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.pageId] })],
);
