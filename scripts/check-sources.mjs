// Checks that every docs.aws.amazon.com URL used in the written pages still answers.
// Usage: node scripts/check-sources.mjs   (needs network access)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES_DIR = new URL('../apps/web/content/pages/', import.meta.url).pathname;
const urls = new Map();

for (const path of readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })) {
  if (!path.endsWith('.mdx')) continue;
  const source = readFileSync(join(PAGES_DIR, path), 'utf8');
  for (const [url] of source.matchAll(/https:\/\/docs\.aws\.amazon\.com\/[^\s"')]+/g)) {
    urls.set(url, [...(urls.get(url) ?? []), path]);
  }
}

let failures = 0;
for (const [url, pages] of urls) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${url} (${pages.join(', ')}): ${String(error)}`);
  }
}
console.log(`${String(urls.size)} source URLs checked, ${String(failures)} failed`);
process.exit(failures === 0 ? 0 : 1);
