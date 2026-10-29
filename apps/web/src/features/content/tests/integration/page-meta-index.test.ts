/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { pageMetaSchema } from '@arquitecto/contracts/content';
import pageMetaIndex from '../../data/page-meta-index.json';
import { buildPageMetaIndex, extractPageMeta } from '../../scripts/page-meta-index';

describe('generated page meta index', () => {
  it('matches the current MDX pages (run `pnpm --filter @arquitecto/web content:index`)', () => {
    expect(pageMetaIndex).toEqual(buildPageMetaIndex());
  });

  it('holds valid meta for every page, keyed by its path', () => {
    const entries = Object.entries(pageMetaIndex);
    expect(entries.length).toBeGreaterThan(0);
    for (const [path, meta] of entries) {
      const parsed = pageMetaSchema.parse(meta);
      expect(path.endsWith(`/${parsed.id}.mdx`)).toBe(true);
    }
    expect(pageMetaIndex['services/amazon-s3.mdx']).toEqual({
      id: 'amazon-s3',
      order: 180,
      title: 'Amazon S3',
      kind: 'service',
      category: 'Almacenamiento',
      covers: ['3.1-k2', '4.1-k1'],
    });
  });

  it('rejects a page without a meta export', () => {
    expect(() => extractPageMeta('# Sin meta', 'topics/sin-meta.mdx')).toThrow(
      'Missing `export const meta = {...};` in topics/sin-meta.mdx',
    );
  });
});
