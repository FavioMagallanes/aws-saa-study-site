import { z } from 'zod';

export const pageIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Page id must be kebab-case')
  .max(80);

export const progressEntrySchema = z.object({
  pageId: pageIdSchema,
  readAt: z.iso.datetime(),
});

export const progressResponseSchema = z.object({
  entries: z.array(progressEntrySchema),
});

export const markReadParamsSchema = z.object({ pageId: pageIdSchema });

export type ProgressEntry = z.infer<typeof progressEntrySchema>;
export type ProgressResponse = z.infer<typeof progressResponseSchema>;
