import { describe, expect, it } from 'vitest';
import { pageMetaSchema } from '../src/content/page-meta.ts';

const valid = { id: 'amazon-sqs', title: 'Amazon SQS', kind: 'service', covers: ['2.1-k2'] };

describe('page meta contract', () => {
  it('accepts a service page that covers a guide bullet', () => {
    expect(pageMetaSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an unknown kind', () => {
    expect(pageMetaSchema.safeParse({ ...valid, kind: 'other' }).success).toBe(false);
  });

  it.each(['5.1-k1', '1.1-x1', '1.1', 'k1'])('rejects malformed bullet id %j', (bullet) => {
    expect(pageMetaSchema.safeParse({ ...valid, covers: [bullet] }).success).toBe(false);
  });
});
