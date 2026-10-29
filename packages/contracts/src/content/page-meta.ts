import { z } from 'zod';
import { pageIdSchema } from '../progress/progress.ts';

export const pageKindSchema = z.enum(['fundamental', 'topic', 'service']);

export const bulletIdSchema = z.string().regex(/^[1-4]\.\d+-[ks]\d+$/, 'Expected e.g. 1.1-k2');

export const pageMetaSchema = z.object({
  id: pageIdSchema,
  title: z.string().min(1),
  kind: pageKindSchema,
  category: z.string().min(1).optional(),
  covers: z.array(bulletIdSchema),
});

export type PageKind = z.infer<typeof pageKindSchema>;
export type PageMeta = z.infer<typeof pageMetaSchema>;
