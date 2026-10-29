import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import { nextPageToRead, summarizeProgress } from '../../model/page-progress';

const page = (id: string, order: number): PageMeta => ({
  id,
  order,
  title: id,
  kind: 'topic',
  covers: [],
});

describe('summarizeProgress', () => {
  it('counts only pages that exist', () => {
    const pages = [page('a', 1), page('b', 2)];
    expect(summarizeProgress(pages, new Set(['a', 'ghost']))).toEqual({
      total: 2,
      read: 1,
      percentage: 50,
    });
  });

  it('reports 0 % for an empty page list instead of dividing by zero', () => {
    expect(summarizeProgress([], new Set())).toEqual({ total: 0, read: 0, percentage: 0 });
  });
});

describe('nextPageToRead', () => {
  const pages = [page('c', 3), page('a', 1), page('b', 2)];

  it('returns the first unread page in reading order', () => {
    expect(nextPageToRead(pages, new Set(['a']))?.id).toBe('b');
  });

  it('falls back to the first page once everything is read', () => {
    expect(nextPageToRead(pages, new Set(['a', 'b', 'c']))?.id).toBe('a');
  });

  it('returns nothing when there are no pages', () => {
    expect(nextPageToRead([], new Set())).toBeUndefined();
  });
});
