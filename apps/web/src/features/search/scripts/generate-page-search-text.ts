/// <reference types="node" />
// Regenerates data/page-search-text.json from the MDX pages:
//   pnpm --filter @arquitecto/web search:index
// The MDX plugin compiles every `.mdx` import (even `?raw`), so the text is extracted ahead of time.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { extractPageText } from '../model/extract-page-text.ts';

const PAGES_DIR = join(import.meta.dirname, '../../../../content/pages');
const OUTPUT_FILE = join(import.meta.dirname, '../data/page-search-text.json');

const pageText = Object.fromEntries(
  readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.mdx'))
    .sort()
    .flatMap((path) => {
      const text = extractPageText(readFileSync(join(PAGES_DIR, path), 'utf8'));
      return text ? [[basename(path, '.mdx'), text]] : [];
    }),
);

const prettierConfig = await resolveConfig(OUTPUT_FILE);
writeFileSync(
  OUTPUT_FILE,
  await format(JSON.stringify(pageText), { ...prettierConfig, parser: 'json' }),
);
console.log(`Wrote search text for ${String(Object.keys(pageText).length)} pages.`);
