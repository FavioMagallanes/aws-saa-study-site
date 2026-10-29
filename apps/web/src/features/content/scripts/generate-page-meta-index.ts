/// <reference types="node" />
// Regenerates data/page-meta-index.json from the MDX pages (runs automatically before dev, build
// and test; manually: pnpm --filter @arquitecto/web content:index).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { buildPageMetaIndex } from './page-meta-index.ts';

const OUTPUT_FILE = join(import.meta.dirname, '../data/page-meta-index.json');

const index = buildPageMetaIndex();

const prettierConfig = await resolveConfig(OUTPUT_FILE);
writeFileSync(
  OUTPUT_FILE,
  await format(JSON.stringify(index), { ...prettierConfig, parser: 'json' }),
);
console.log(`Wrote meta for ${String(Object.keys(index).length)} pages.`);
