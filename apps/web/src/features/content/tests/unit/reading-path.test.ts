import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import { examGuide } from '../../data/load-exam-guide';
import { loadPages } from '../../data/load-pages';
import type { ExamGuide } from '../../model/exam-guide';
import {
  buildReadingPath,
  firstUnreadInPath,
  nextInPath,
  pathPosition,
  previousInPath,
  summarizeGroup,
  summarizeSection,
} from '../../model/reading-path';

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
    { id: '1.3', title: 'Datos', knowledge: [], skills: [] },
    { id: '2.1', title: 'Acoplamiento', knowledge: [], skills: [] },
  ],
  services: [
    { category: 'Integración', name: 'Amazon SQS' },
    { category: 'Computación', name: 'Amazon EC2' },
  ],
};

const syntheticPages = [
  page('global', 2, { kind: 'fundamental', covers: ['2.1-k1'] }),
  page('well-architected', 1, { kind: 'fundamental' }),
  page('vpc', 5, { covers: ['2.1-k1', '1.2-s1'] }),
  page('iam', 3, { covers: ['1.1-k1'] }),
  page('roles', 4, { covers: ['1.1-k2', '2.1-s1'] }),
  page('queues', 6, { covers: ['2.1-k2'] }),
  page('amazon-ec2', 8, { kind: 'service', category: 'Computación' }),
  page('amazon-sqs', 7, { kind: 'service', category: 'Integración', covers: ['2.1-k2'] }),
];

const idsOf = (pages: readonly PageMeta[]): string[] => pages.map((item) => item.id);

describe('buildReadingPath', () => {
  const path = buildReadingPath(syntheticPages, guide);

  it('orders the sections as Fundamentos, each domain and Servicios', () => {
    expect(path.sections.map((section) => section.title)).toEqual([
      'Fundamentos',
      'Dominio 1 · Seguras',
      'Dominio 2 · Resistentes',
      'Servicios',
    ]);
  });

  it('puts every fundamental in Fundamentos by order, even when it covers exam tasks', () => {
    expect(idsOf(path.sections[0]?.pages ?? [])).toEqual(['well-architected', 'global']);
  });

  it('assigns a topic to the lowest task it covers and omits tasks without pages', () => {
    const domainOne = path.sections[1];
    expect(domainOne?.groups.map((group) => [group.label, idsOf(group.pages)])).toEqual([
      ['Tarea 1.1 · Acceso', ['iam', 'roles']],
      ['Tarea 1.2 · Cargas', ['vpc']],
    ]);
    expect(path.sections[2]?.groups.map((group) => [group.label, idsOf(group.pages)])).toEqual([
      ['Tarea 2.1 · Acoplamiento', ['queues']],
    ]);
  });

  it('groups services by category in the exam guide order', () => {
    expect(path.sections[3]?.groups.map((group) => [group.label, idsOf(group.pages)])).toEqual([
      ['Integración', ['amazon-sqs']],
      ['Computación', ['amazon-ec2']],
    ]);
  });

  it('flattens the sections into one sequence', () => {
    expect(idsOf(path.sequence)).toEqual([
      'well-architected',
      'global',
      'iam',
      'roles',
      'vpc',
      'queues',
      'amazon-sqs',
      'amazon-ec2',
    ]);
  });

  it('keeps a topic without covers in an Otros temas group of the last domain', () => {
    const withLoose = buildReadingPath([...syntheticPages, page('loose', 9)], guide);
    const lastDomain = withLoose.sections[2];
    expect(lastDomain?.groups.at(-1)?.label).toBe('Otros temas');
    expect(idsOf(lastDomain?.groups.at(-1)?.pages ?? [])).toEqual(['loose']);
    expect(withLoose.sequence).toHaveLength(syntheticPages.length + 1);
  });

  it('summarizes the progress of a section and of a group', () => {
    const read = new Set(['iam', 'queues']);
    const domainOne = path.sections[1];
    const firstTask = domainOne?.groups[0];
    if (!domainOne || !firstTask) throw new Error('Domain 1 is missing from the path');
    expect(summarizeSection(domainOne, read)).toEqual({
      total: 3,
      read: 1,
      percentage: 33,
    });
    expect(summarizeGroup(firstTask, read)).toEqual({
      total: 2,
      read: 1,
      percentage: 50,
    });
  });
});

describe('path navigation', () => {
  const path = buildReadingPath(syntheticPages, guide);

  it('locates a page by section, group and sequence index', () => {
    const position = pathPosition(path, 'vpc');
    expect(position?.section.title).toBe('Dominio 1 · Seguras');
    expect(position?.group.label).toBe('Tarea 1.2 · Cargas');
    expect(position?.index).toBe(4);
    expect(pathPosition(path, 'ghost')).toBeUndefined();
  });

  it('moves across a task, a domain and into the services', () => {
    expect(nextInPath(path, 'roles')?.id).toBe('vpc');
    expect(nextInPath(path, 'vpc')?.id).toBe('queues');
    expect(previousInPath(path, 'queues')?.id).toBe('vpc');
    expect(nextInPath(path, 'queues')?.id).toBe('amazon-sqs');
  });

  it('has nothing before the first page or after the last one', () => {
    expect(previousInPath(path, 'well-architected')).toBeUndefined();
    expect(nextInPath(path, 'amazon-ec2')).toBeUndefined();
  });

  it('finds the first unread page in path order, or the first page when all are read', () => {
    expect(firstUnreadInPath(path, new Set(['well-architected', 'global']))?.id).toBe('iam');
    expect(firstUnreadInPath(path, new Set(idsOf(path.sequence)))?.id).toBe('well-architected');
    expect(firstUnreadInPath(buildReadingPath([], guide), new Set())).toBeUndefined();
  });
});

describe('reading path over the real content', () => {
  const pages = loadPages();
  const path = buildReadingPath(pages, examGuide);

  it('includes every page exactly once', () => {
    const ids = idsOf(path.sequence);
    expect(ids).toHaveLength(182);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(idsOf(pages).sort());
  });

  it('runs Fundamentos, the four domains and then Servicios', () => {
    expect(path.sections.map((section) => section.title)).toEqual([
      'Fundamentos',
      'Dominio 1 · Seguras',
      'Dominio 2 · Resistentes',
      'Dominio 3 · Alto rendimiento',
      'Dominio 4 · Costos',
      'Servicios',
    ]);
    expect(path.sections[0]?.pages).toHaveLength(7);
    expect(path.sections[5]?.pages).toHaveLength(118);
    expect(path.sections[5]?.groups.map((group) => group.label)).toEqual([
      ...new Set(examGuide.services.map((service) => service.category)),
    ]);
  });

  it('places a topic that covers several domains under its lowest task', () => {
    const position = pathPosition(path, 'conectividad-hibrida-vpn-direct-connect-y-privatelink');
    expect(position?.group.label).toBe(
      'Tarea 1.2 · Diseñar cargas de trabajo y aplicaciones seguras',
    );
  });

  it('crosses from the last fundamental into the first task of domain 1', () => {
    expect(nextInPath(path, 'modelos-de-computo-instancias-contenedores-y-sin-servidor')?.id).toBe(
      'iam-usuarios-grupos-roles-politicas-y-mfa',
    );
  });

  it('crosses a task boundary and a domain boundary in sidebar order', () => {
    expect(nextInPath(path, 'politicas-basadas-en-recursos')?.id).toBe(
      'seguridad-de-la-vpc-grupos-de-seguridad-acl-de-red-y-segmentacion',
    );
    expect(nextInPath(path, 'clases-de-almacenamiento-y-ciclo-de-vida-de-s3')?.id).toBe(
      'arquitecturas-de-varios-niveles',
    );
    expect(previousInPath(path, 'arquitecturas-de-varios-niveles')?.id).toBe(
      'clases-de-almacenamiento-y-ciclo-de-vida-de-s3',
    );
  });

  it('crosses from the last domain page to the first service page', () => {
    expect(nextInPath(path, 'transit-gateway-frente-a-interconexion-de-vpc')?.id).toBe(
      'amazon-athena',
    );
    expect(previousInPath(path, 'amazon-athena')?.id).toBe(
      'transit-gateway-frente-a-interconexion-de-vpc',
    );
  });
});
