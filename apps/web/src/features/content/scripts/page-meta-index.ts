/// <reference types="node" />
// Build-time only: reads the `meta` export of every MDX page without importing the page module,
// so the app bundle never pulls page bodies in just to list pages.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

export const PAGES_DIR = join(import.meta.dirname, '../../../../content/pages');

const META_EXPORT_PATTERN = /^export const meta = (\{[\s\S]*?^\});?$/m;

export const extractPageMeta = (source: string, path: string): unknown => {
  const literal = META_EXPORT_PATTERN.exec(source)?.[1];
  if (literal === undefined) throw new Error(`Missing \`export const meta = {...};\` in ${path}`);
  // The literal comes from our own content files; evaluating it in an empty context keeps the
  // exact JavaScript semantics MDX would apply, and the JSON round trip drops the foreign realm.
  const meta: unknown = runInNewContext(`(${literal})`, {}, { timeout: 1000 });
  return JSON.parse(JSON.stringify(meta));
};

export const buildPageMetaIndex = (pagesDir = PAGES_DIR): Record<string, unknown> =>
  Object.fromEntries(
    readdirSync(pagesDir, { recursive: true, encoding: 'utf8' })
      .filter((path) => path.endsWith('.mdx'))
      .map((path) => path.split('\\').join('/'))
      .sort()
      .map((path) => [path, extractPageMeta(readFileSync(join(pagesDir, path), 'utf8'), path)]),
  );
