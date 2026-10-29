import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../../content/model/exam-guide';
import { buildExamMap } from '../../model/exam-map';

const page = (id: string, order: number, covers: string[]): PageMeta => ({
  id,
  order,
  title: id.toUpperCase(),
  kind: 'topic',
  covers,
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
  services: [],
};

describe('buildExamMap', () => {
  const pages = [
    page('vpc', 2, ['1.1-k1', '2.1-s1']),
    page('iam', 1, ['1.1-k2']),
    page('kms', 3, ['1.2-k1']),
  ];

  it('groups tasks by domain and lists their pages in reading order', () => {
    const [first] = buildExamMap(pages, guide, new Set());
    expect(first?.tasks.map((task) => task.id)).toEqual(['1.1', '1.2']);
    expect(first?.tasks[0]?.pages.map((p) => p.id)).toEqual(['iam', 'vpc']);
  });

  it('shows a page under every task it covers', () => {
    const [, second] = buildExamMap(pages, guide, new Set());
    expect(second?.tasks[0]?.pages.map((p) => p.id)).toEqual(['vpc']);
  });

  it('counts read pages per task and per domain', () => {
    const [first] = buildExamMap(pages, guide, new Set(['iam']));
    expect(first?.tasks[0]).toMatchObject({ readCount: 1 });
    expect(first?.tasks[1]).toMatchObject({ readCount: 0 });
    expect(first?.summary).toEqual({ total: 3, read: 1, percentage: 33 });
  });

  it('keeps a task without pages visible instead of dropping it', () => {
    const [first] = buildExamMap([page('iam', 1, ['1.1-k1'])], guide, new Set());
    expect(first?.tasks[1]).toMatchObject({ id: '1.2', pages: [], readCount: 0 });
  });
});
