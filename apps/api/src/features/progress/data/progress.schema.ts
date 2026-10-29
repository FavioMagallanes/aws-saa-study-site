import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const readPages = pgTable('read_pages', {
  pageId: text('page_id').primaryKey(),
  readAt: timestamp('read_at', { withTimezone: true }).notNull().defaultNow(),
});
