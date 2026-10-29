/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The MDX plugin also compiles `?raw` imports, so the sources are read from disk instead.
const PAGES_DIR = join(import.meta.dirname, '../../../../../content/pages');

const readSources = (): [string, string][] =>
  readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.mdx'))
    .map((path): [string, string] => [path, readFileSync(join(PAGES_DIR, path), 'utf8')]);

const sources = readSources();
const PENDING_BODY = 'Contenido pendiente.';
const written = sources.filter(([, source]) => !source.includes(PENDING_BODY));

describe('written pages', () => {
  it('has at least one written page', () => {
    expect(written.length).toBeGreaterThan(0);
  });

  it('cites official sources from docs.aws.amazon.com', () => {
    const withoutSources = written
      .filter(
        ([, source]) => !/<OfficialSource[^>]*url="https:\/\/docs\.aws\.amazon\.com\//.test(source),
      )
      .map(([path]) => path);
    expect(withoutSources).toEqual([]);
  });

  it('ends with a "Fuentes oficiales" section', () => {
    const missing = written
      .filter(([, source]) => !/^## Fuentes oficiales$/m.test(source))
      .map(([path]) => path);
    expect(missing).toEqual([]);
  });

  it('does not link to anything outside docs.aws.amazon.com', () => {
    const offenders = written.flatMap(([path, source]) =>
      [...source.matchAll(/https?:\/\/[^\s"')]+/g)]
        .map((match) => match[0])
        .filter((url) => new URL(url).hostname !== 'docs.aws.amazon.com')
        .map((url) => `${path}: ${url}`),
    );
    expect(offenders).toEqual([]);
  });
});
