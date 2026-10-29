import { describe, expect, it } from 'vitest';
import { loadPages } from '../../../content/data/load-pages';
import { glossary } from '../../data/load-glossary';

describe('glossary data', () => {
  it('has unique abbreviations and ids', () => {
    const abbreviations = glossary.map((entry) => entry.abbreviation);
    expect(new Set(abbreviations).size).toBe(abbreviations.length);
    expect(new Set(glossary.map((entry) => entry.id)).size).toBe(glossary.length);
  });

  it('is sorted alphabetically by abbreviation', () => {
    const abbreviations = glossary.map((entry) => entry.abbreviation.toLowerCase());
    expect(abbreviations).toEqual([...abbreviations].sort());
  });

  it('only links to pages that exist', () => {
    const pageIds = new Set(loadPages().map((page) => page.id));
    const missing = glossary.flatMap((entry) =>
      entry.pages.filter((pageId) => !pageIds.has(pageId)).map((pageId) => `${entry.id}:${pageId}`),
    );
    expect(missing).toEqual([]);
  });

  it('cites an official AWS documentation source for every entry', () => {
    const outside = glossary.filter(
      (entry) => new URL(entry.source.url).hostname !== 'docs.aws.amazon.com',
    );
    expect(outside).toEqual([]);
  });
});
