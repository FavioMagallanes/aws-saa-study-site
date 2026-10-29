import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../../content/model/exam-guide';
import { buildReadingContext } from '../../model/reading-context';

const page = (id: string, order: number, overrides: Partial<PageMeta> = {}): PageMeta => ({
  id,
  order,
  title: id,
  kind: 'topic',
  covers: [],
  ...overrides,
});

const guide: ExamGuide = {
  domains: [{ id: 2, title: 'Resistentes', weight: 100 }],
  tasks: [
    { id: '2.1', title: 'Acoplamiento débil', knowledge: [], skills: [] },
    { id: '2.2', title: 'Alta disponibilidad', knowledge: [], skills: [] },
  ],
  services: [],
};

describe('buildReadingContext', () => {
  const pages = [
    page('queues', 1, { covers: ['2.1-k1'] }),
    page('amazon-sqs', 2, {
      kind: 'service',
      category: 'Integración',
      covers: ['2.1-k2', '2.2-s1'],
    }),
    page('amazon-sns', 3, { kind: 'service', category: 'Integración' }),
    page('amazon-mq', 4, { kind: 'service', category: 'Integración' }),
  ];

  const pageAt = (index: number): PageMeta => {
    const found = pages[index];
    if (!found) throw new Error(`No test page at ${String(index)}`);
    return found;
  };

  it('lists the exam tasks a page covers, once each', () => {
    const context = buildReadingContext(pageAt(1), pages, guide, new Set());
    expect(context.examTasks.map((task) => task.id)).toEqual(['2.1', '2.2']);
  });

  it('expands only the primary task in the sidebar and marks the current page', () => {
    const context = buildReadingContext(pageAt(1), pages, guide, new Set(['queues']));
    expect(context.sidebarHeading).toBe('Dominio 2 · Resistentes');
    const [first, second] = context.sidebarGroups;
    expect(first?.pages.map((p) => [p.id, p.current, p.read])).toEqual([
      ['queues', false, true],
      ['amazon-sqs', true, false],
    ]);
    expect(second?.pages).toEqual([]);
  });

  it('falls back to the category when the page covers no task', () => {
    const context = buildReadingContext(pageAt(2), pages, guide, new Set());
    expect(context.sidebarHeading).toBe('Integración');
    expect(context.sidebarGroups[0]?.pages.map((p) => p.id)).toEqual([
      'amazon-sqs',
      'amazon-sns',
      'amazon-mq',
    ]);
    expect(context.examTasks).toEqual([]);
  });

  it('links to the previous and next page in reading order', () => {
    const context = buildReadingContext(pageAt(1), pages, guide, new Set());
    expect(context.previous?.id).toBe('queues');
    expect(context.next?.id).toBe('amazon-sns');
  });

  it('has no previous page at the start and no next page at the end', () => {
    expect(buildReadingContext(pageAt(0), pages, guide, new Set()).previous).toBeUndefined();
    expect(buildReadingContext(pageAt(3), pages, guide, new Set()).next).toBeUndefined();
  });
});
