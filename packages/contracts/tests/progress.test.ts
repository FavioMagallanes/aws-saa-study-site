import { describe, expect, it } from 'vitest';
import { markReadParamsSchema, progressEntrySchema } from '../src/progress/progress.ts';

describe('progress contracts', () => {
  it('accepts a kebab-case page id', () => {
    expect(markReadParamsSchema.safeParse({ pageId: 'amazon-sqs' }).success).toBe(true);
  });

  it.each(['Amazon SQS', '../etc/passwd', '', 'a--b', 'x'.repeat(81)])(
    'rejects invalid page id %j',
    (pageId) => {
      expect(markReadParamsSchema.safeParse({ pageId }).success).toBe(false);
    },
  );

  it('rejects an entry with a non-ISO date', () => {
    expect(
      progressEntrySchema.safeParse({ pageId: 'amazon-sqs', readAt: 'yesterday' }).success,
    ).toBe(false);
  });
});
