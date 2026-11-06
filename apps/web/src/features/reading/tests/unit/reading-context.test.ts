import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../../content/model/exam-guide';
import { buildReadingPath } from '../../../content/model/reading-path';
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
  domains: [
    { id: 1, title: 'Seguras', weight: 50 },
    { id: 2, title: 'Resistentes', weight: 50 },
  ],
  tasks: [
    { id: '1.1', title: 'Acceso', knowledge: [], skills: [] },
    { id: '1.2', title: 'Cargas', knowledge: [], skills: [] },
    { id: '2.1', title: 'Acoplamiento débil', knowledge: [], skills: [] },
    { id: '2.2', title: 'Alta disponibilidad', knowledge: [], skills: [] },
  ],
  services: [
    { category: 'Integración', name: 'Amazon SQS' },
    { category: 'Computación', name: 'Amazon EC2' },
  ],
};

const pages = [
  page('global', 1, { kind: 'fundamental', covers: ['1.1-k1'] }),
  page('iam', 2, { covers: ['1.1-k1'] }),
  page('roles', 3, { covers: ['1.1-k2'] }),
  page('vpc', 4, { covers: ['1.2-k1', '2.1-k1'] }),
  page('queues', 5, { covers: ['2.1-k1'] }),
  page('failover', 6, { covers: ['2.2-k1'] }),
  page('amazon-sqs', 7, {
    kind: 'service',
    category: 'Integración',
    covers: ['2.1-k2', '2.2-s1'],
  }),
  page('amazon-sns', 8, { kind: 'service', category: 'Integración' }),
  page('amazon-ec2', 9, { kind: 'service', category: 'Computación' }),
];

const path = buildReadingPath(pages, guide);

const contextOf = (id: string, read: ReadonlySet<string> = new Set()) => {
  const current = pages.find((candidate) => candidate.id === id);
  if (!current) throw new Error(`No test page ${id}`);
  return buildReadingContext(current, path, guide, read);
};

describe('buildReadingContext', () => {
  it('lists the exam tasks a page covers, once each', () => {
    expect(contextOf('amazon-sqs').examTasks.map((task) => task.id)).toEqual(['2.1', '2.2']);
  });

  it('shows the whole path with only the section of the current page open', () => {
    const sections = contextOf('vpc', new Set(['iam', 'queues'])).sidebarSections;
    expect(sections.map((section) => [section.title, section.open])).toEqual([
      ['Fundamentos', false],
      ['Dominio 1 · Seguras', true],
      ['Dominio 2 · Resistentes', false],
      ['Servicios', false],
    ]);
    expect(sections.map((section) => [section.read, section.total])).toEqual([
      [0, 1],
      [1, 3],
      [1, 2],
      [0, 3],
    ]);
  });

  it('lists every task of the domain with its pages and marks the current one', () => {
    const domainOne = contextOf('vpc', new Set(['iam'])).sidebarSections[1];
    expect(domainOne?.groups.map((group) => [group.label, group.current])).toEqual([
      ['Tarea 1.1 · Acceso', false],
      ['Tarea 1.2 · Cargas', true],
    ]);
    expect(
      domainOne?.groups.flatMap((group) => group.pages.map((p) => [p.id, p.current, p.read])),
    ).toEqual([
      ['iam', false, true],
      ['roles', false, false],
      ['vpc', true, false],
    ]);
  });

  it('hides the group label of a section with a single unnamed group', () => {
    const [fundamentals] = contextOf('global').sidebarSections;
    expect(fundamentals?.groups.map((group) => group.label)).toEqual([undefined]);
  });

  it('builds the breadcrumb from the path position', () => {
    expect(contextOf('global').breadcrumb).toEqual(['Fundamentos']);
    expect(contextOf('vpc').breadcrumb).toEqual(['Dominio 1', 'Tarea 1.2']);
    expect(contextOf('amazon-ec2').breadcrumb).toEqual(['Servicios', 'Computación']);
  });

  it('follows the path order, not the global order, for previous and next', () => {
    const context = contextOf('amazon-sqs');
    expect(context.previous?.page.id).toBe('failover');
    expect(context.next?.page.id).toBe('amazon-sns');
  });

  it('names where a neighbour leads only when it is in another group or section', () => {
    expect(contextOf('iam').next).toMatchObject({ page: { id: 'roles' }, destination: undefined });
    expect(contextOf('roles').next?.destination).toBe('Tarea 1.2 · Cargas');
    expect(contextOf('vpc').previous?.destination).toBe('Tarea 1.1 · Acceso');
    expect(contextOf('vpc').next?.destination).toBe('Dominio 2 · Resistentes');
    expect(contextOf('global').next?.destination).toBe('Dominio 1 · Seguras');
    expect(contextOf('iam').previous?.destination).toBe('Fundamentos');
    expect(contextOf('failover').next?.destination).toBe('Servicios · Integración');
    expect(contextOf('amazon-sns').next?.destination).toBe('Servicios · Computación');
  });

  it('has no previous page at the start and no next page at the end', () => {
    expect(contextOf('global').previous).toBeUndefined();
    expect(contextOf('amazon-ec2').next).toBeUndefined();
  });
});
