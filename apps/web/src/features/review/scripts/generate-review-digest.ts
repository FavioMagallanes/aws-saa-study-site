/// <reference types="node" />
// Regenerates data/review-digest.json from the MDX pages (runs automatically before dev, build
// and test; manually: pnpm --filter @arquitecto/web review:index).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { buildReviewDigestIndex } from './review-digest-index.ts';

const OUTPUT_FILE = join(import.meta.dirname, '../data/review-digest.json');

const index = buildReviewDigestIndex();

const prettierConfig = await resolveConfig(OUTPUT_FILE);
writeFileSync(
  OUTPUT_FILE,
  await format(JSON.stringify(index), { ...prettierConfig, parser: 'json' }),
);
console.log(`Wrote review digest for ${String(Object.keys(index).length)} pages.`);
