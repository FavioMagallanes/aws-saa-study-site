import { describe, expect, it } from 'vitest';
import { loadPages } from '../../data/load-pages';

const mdxMetaByPath = import.meta.glob<unknown>('../../../../../content/pages/**/*.mdx', {
  eager: true,
  import: 'meta',
});

describe('loadPages', () => {
  it('returns the same meta, in the same order, as the MDX `meta` exports', () => {
    expect(loadPages()).toEqual(Object.values(mdxMetaByPath));
  });
});
