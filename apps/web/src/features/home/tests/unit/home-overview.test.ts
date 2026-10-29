import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../../content/model/exam-guide';
import {
  nextPageToRead,
  overviewDomains,
  overviewServiceCategories,
  summarizeProgress,
} from '../../model/home-overview';

const page = (id: string, order: number, overrides: Partial<PageMeta> = {}): PageMeta => ({
  id,
  order,
  title: id,
  kind: 'topic',
  covers: [],
  ...overrides,
});

const guide: ExamGuide = {
  domains: [
    { id: 1, title: 'Seguras', weight: 60 },
    { id: 2, title: 'Resistentes', weight: 40 },
  ],
  tasks: [
    { id: '1.1', title: 'A', knowledge: [], skills: [] },
    { id: '1.2', title: 'B', knowledge: [], skills: [] },
    { id: '2.1', title: 'C', knowledge: [], skills: [] },
  ],
  services: [
    { category: 'Cómputo', name: 'Amazon EC2' },
    { category: 'Cómputo', name: 'AWS Batch' },
    { category: 'Cómputo', name: 'AWS Lambda' },
  ],
};

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

describe('overviewDomains', () => {
  const pages = [
    page('iam', 1, { covers: ['1.1-k1'] }),
    page('vpc', 2, { covers: ['1.2-s1', '2.1-k1'] }),
    page('queues', 3, { covers: ['2.1-k2'] }),
  ];

  it('derives the task range and progress of each domain', () => {
    const [first, second] = overviewDomains(pages, guide, new Set(['vpc']));
    expect(first).toMatchObject({ id: 1, firstTask: '1.1', lastTask: '1.2', weight: 60 });
    expect(first?.summary).toEqual({ total: 2, read: 1, percentage: 50 });
    expect(first?.startPageId).toBe('iam');
    expect(second?.summary).toEqual({ total: 2, read: 1, percentage: 50 });
    expect(second?.startPageId).toBe('queues');
  });

  it('counts a page that covers several domains in each of them', () => {
    const overview = overviewDomains(pages, guide, new Set());
    expect(overview.map((domain) => domain.summary.total)).toEqual([2, 2]);
  });
});

describe('overviewServiceCategories', () => {
  const pages = [
    page('amazon-ec2', 1, { kind: 'service', title: 'Amazon EC2' }),
    page('aws-batch', 2, { kind: 'service', title: 'AWS Batch' }),
    page('aws-lambda', 3, { kind: 'service', title: 'AWS Lambda' }),
  ];

  it('limits visible services and counts the hidden ones', () => {
    const [category] = overviewServiceCategories(
      pages,
      guide,
      ['Cómputo'],
      new Set(['aws-batch']),
      2,
    );
    expect(category?.services.map((service) => service.name)).toEqual(['Amazon EC2', 'AWS Batch']);
    expect(category?.services[1]?.read).toBe(true);
    expect(category?.hiddenCount).toBe(1);
  });

  it('skips a service that has no page instead of linking to nothing', () => {
    const [category] = overviewServiceCategories(
      pages.slice(0, 1),
      guide,
      ['Cómputo'],
      new Set(),
      5,
    );
    expect(category?.services.map((service) => service.name)).toEqual(['Amazon EC2']);
  });
});
