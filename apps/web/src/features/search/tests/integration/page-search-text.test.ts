/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractPageText } from '../../model/extract-page-text';
import pageSearchText from '../../data/page-search-text.json';

const PAGES_DIR = join(import.meta.dirname, '../../../../../content/pages');

const expectedPageText = () =>
  Object.fromEntries(
    readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })
      .filter((path) => path.endsWith('.mdx'))
      .sort()
      .flatMap((path) => {
        const text = extractPageText(readFileSync(join(PAGES_DIR, path), 'utf8'));
        return text ? [[basename(path, '.mdx'), text]] : [];
      }),
  );

describe('generated page search text', () => {
  it('matches the current MDX pages (run `pnpm --filter @arquitecto/web search:index`)', () => {
    expect(pageSearchText).toEqual(expectedPageText());
  });

  it('includes the written pages', () => {
    expect(Object.keys(pageSearchText)).toContain('amazon-s3');
    expect(Object.keys(pageSearchText)).toContain('amazon-elastic-transcoder');
  });
});
