/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { extractReviewDigest, type ReviewDigest } from './extract-review-digest.ts';

const PAGES_DIR = join(import.meta.dirname, '../../../../content/pages');

export const buildReviewDigestIndex = (pagesDir = PAGES_DIR): Record<string, ReviewDigest> =>
  Object.fromEntries(
    readdirSync(pagesDir, { recursive: true, encoding: 'utf8' })
      .filter((path) => path.endsWith('.mdx'))
      .sort()
      .flatMap((path) => {
        const digest = extractReviewDigest(readFileSync(join(pagesDir, path), 'utf8'));
        return digest ? [[basename(path, '.mdx'), digest]] : [];
      }),
  );
