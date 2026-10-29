import { z } from 'zod';
import { pageIdSchema } from '../progress/progress.ts';

const OFFICIAL_DOCS_HOST = 'docs.aws.amazon.com';

const isOfficialDocsUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === OFFICIAL_DOCS_HOST;
  } catch {
    return false;
  }
};

const officialDocsUrlSchema = z
  .string()
  .refine(isOfficialDocsUrl, `Source must be an https://${OFFICIAL_DOCS_HOST} URL`);

export const glossaryEntrySchema = z.object({
  id: pageIdSchema,
  abbreviation: z.string().min(1).max(12),
  fullName: z.string().min(1),
  definition: z.string().min(20),
  source: z.object({ title: z.string().min(1), url: officialDocsUrlSchema }),
  pages: z.array(pageIdSchema),
});

export const glossarySchema = z.array(glossaryEntrySchema);

export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
