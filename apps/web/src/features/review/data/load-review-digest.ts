import { z } from 'zod';

const reviewDigestSchema = z.record(
  z.string(),
  z.object({
    intro: z.string(),
    problem: z.string(),
    concepts: z.array(z.object({ term: z.string(), summary: z.string() })),
    whenToUse: z.array(z.string()),
  }),
);

// Loaded on demand: the digest of every page is large and only the review screen needs it.
export const loadReviewDigest = async () =>
  reviewDigestSchema.parse((await import('./review-digest.json')).default);
