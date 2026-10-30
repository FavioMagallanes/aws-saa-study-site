/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// index.html and public/ are served as-is by Vite, so they are checked on disk.
const WEB_ROOT = join(import.meta.dirname, '../../../..');
const FAVICON_PATH = join(WEB_ROOT, 'public/favicon.svg');

const parseIndexHtml = (): Document =>
  new DOMParser().parseFromString(readFileSync(join(WEB_ROOT, 'index.html'), 'utf8'), 'text/html');

describe('document head', () => {
  it('links the SVG favicon that public/ serves from the site root', () => {
    const icons = [...parseIndexHtml().querySelectorAll('link[rel="icon"]')];
    expect(icons.map((icon) => [icon.getAttribute('type'), icon.getAttribute('href')])).toEqual([
      ['image/svg+xml', '/favicon.svg'],
    ]);
    expect(existsSync(FAVICON_PATH)).toBe(true);
  });

  it('draws the favicon in the brand colours with a dark variant and no fonts', () => {
    const svg = readFileSync(FAVICON_PATH, 'utf8');
    expect(svg).toMatch(/^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toContain('#a8502e');
    expect(svg).toContain('#f6f1e8');
    expect(svg).toMatch(/@media \(prefers-color-scheme: dark\)/);
    expect(svg).toContain('#e28c62');
    expect(svg).toContain('#1b1814');
    expect(svg).not.toMatch(/<text|font-family/);
  });

  it('sets the browser theme colour for the light and the dark scheme', () => {
    const themeColors = [...parseIndexHtml().querySelectorAll('meta[name="theme-color"]')];
    expect(
      themeColors.map((meta) => [meta.getAttribute('media'), meta.getAttribute('content')]),
    ).toEqual([
      ['(prefers-color-scheme: light)', '#f6f1e8'],
      ['(prefers-color-scheme: dark)', '#1b1814'],
    ]);
  });
});
