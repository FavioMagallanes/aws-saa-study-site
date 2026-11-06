import type { PageMeta } from '@arquitecto/contracts/content';
import { DOMAIN_SHORT_TITLES } from './domain-labels';
import type { ExamGuide } from './exam-guide';
import {
  byOrder,
  summarizeProgress,
  type ProgressSummary,
  type ReadPageIds,
} from './page-progress';

export type ReadingSectionKind = 'fundamentals' | 'domain' | 'services';

export interface ReadingPathGroup {
  readonly id: string;
  /** Full name shown in the sidebar, such as "Tarea 1.2 · <task title>" or a service category. */
  readonly label: string;
  /** Short name used in the breadcrumb, such as "Tarea 1.2". */
  readonly crumb: string;
  readonly pages: readonly PageMeta[];
}

export interface ReadingPathSection {
  readonly id: string;
  readonly kind: ReadingSectionKind;
  readonly domainId: number | undefined;
  /** Name shown in the sidebar, such as "Dominio 1 · Seguras". */
  readonly title: string;
  /** Short name used in the breadcrumb, such as "Dominio 1". */
  readonly crumb: string;
  readonly groups: readonly ReadingPathGroup[];
  readonly pages: readonly PageMeta[];
}

export interface ReadingPath {
  readonly sections: readonly ReadingPathSection[];
  /** Every page once, in the order the sections and groups list them. */
  readonly sequence: readonly PageMeta[];
}

export interface PathPosition {
  readonly section: ReadingPathSection;
  readonly group: ReadingPathGroup;
  /** Index of the page in the flattened sequence. */
  readonly index: number;
}

const OTHER_TOPICS_LABEL = 'Otros temas';
const OTHER_SERVICES_LABEL = 'Otros servicios';

const compareTaskIds = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true });

const taskIdOf = (bulletId: string): string => bulletId.slice(0, bulletId.indexOf('-'));

// A topic that covers several tasks is read once, under the lowest of them.
const primaryTaskIdOf = (page: PageMeta): string | undefined =>
  page.covers.map(taskIdOf).sort(compareTaskIds)[0];

const section = (fields: Omit<ReadingPathSection, 'pages'>): ReadingPathSection => ({
  ...fields,
  pages: fields.groups.flatMap((group) => group.pages),
});

const nonEmpty = (groups: readonly ReadingPathGroup[]): ReadingPathGroup[] =>
  groups.filter((group) => group.pages.length > 0);

export const buildReadingPath = (pages: readonly PageMeta[], guide: ExamGuide): ReadingPath => {
  const ordered = [...pages].sort(byOrder);
  const fundamentals = ordered.filter((page) => page.kind === 'fundamental');
  const topics = ordered.filter((page) => page.kind === 'topic');
  const services = ordered.filter((page) => page.kind === 'service');

  const knownTaskIds = new Set(guide.tasks.map((task) => task.id));
  const topicsByTask = new Map<string, PageMeta[]>();
  const looseTopics: PageMeta[] = [];
  for (const topic of topics) {
    const taskId = primaryTaskIdOf(topic);
    if (taskId === undefined || !knownTaskIds.has(taskId)) {
      looseTopics.push(topic);
      continue;
    }
    topicsByTask.set(taskId, [...(topicsByTask.get(taskId) ?? []), topic]);
  }

  const lastDomainId = guide.domains.at(-1)?.id;
  const domainSections = guide.domains.map((domain) => {
    const domainNumber = String(domain.id);
    const taskGroups = guide.tasks
      .filter((task) => task.id.startsWith(`${domainNumber}.`))
      .map((task): ReadingPathGroup => ({
        id: `task-${task.id}`,
        label: `Tarea ${task.id} · ${task.title}`,
        crumb: `Tarea ${task.id}`,
        pages: topicsByTask.get(task.id) ?? [],
      }));
    const otherGroup: ReadingPathGroup[] =
      domain.id === lastDomainId
        ? [
            {
              id: 'other-topics',
              label: OTHER_TOPICS_LABEL,
              crumb: OTHER_TOPICS_LABEL,
              pages: looseTopics,
            },
          ]
        : [];
    return section({
      id: `domain-${domainNumber}`,
      kind: 'domain',
      domainId: domain.id,
      title: `Dominio ${domainNumber} · ${DOMAIN_SHORT_TITLES[domain.id] ?? domain.title}`,
      crumb: `Dominio ${domainNumber}`,
      groups: nonEmpty([...taskGroups, ...otherGroup]),
    });
  });

  // Categories follow the exam guide, like the services index; unknown ones go after them.
  const guideCategories = [...new Set(guide.services.map((service) => service.category))];
  const extraCategories = [
    ...new Set(
      services.flatMap((page) =>
        page.category === undefined || guideCategories.includes(page.category)
          ? []
          : [page.category],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, 'es'));
  const categoryGroups = [...guideCategories, ...extraCategories].map(
    (category): ReadingPathGroup => ({
      id: `category-${category}`,
      label: category,
      crumb: category,
      pages: services.filter((page) => page.category === category),
    }),
  );
  const uncategorized: ReadingPathGroup = {
    id: 'other-services',
    label: OTHER_SERVICES_LABEL,
    crumb: OTHER_SERVICES_LABEL,
    pages: services.filter((page) => page.category === undefined),
  };

  const sections = [
    section({
      id: 'fundamentals',
      kind: 'fundamentals',
      domainId: undefined,
      title: 'Fundamentos',
      crumb: 'Fundamentos',
      groups: nonEmpty([
        { id: 'fundamentals', label: 'Fundamentos', crumb: 'Fundamentos', pages: fundamentals },
      ]),
    }),
    ...domainSections,
    section({
      id: 'services',
      kind: 'services',
      domainId: undefined,
      title: 'Servicios',
      crumb: 'Servicios',
      groups: nonEmpty([...categoryGroups, uncategorized]),
    }),
  ];

  return { sections, sequence: sections.flatMap((item) => item.pages) };
};

export const pathPosition = (path: ReadingPath, pageId: string): PathPosition | undefined => {
  let index = 0;
  for (const pathSection of path.sections) {
    for (const group of pathSection.groups) {
      const inGroup = group.pages.findIndex((page) => page.id === pageId);
      if (inGroup >= 0) return { section: pathSection, group, index: index + inGroup };
      index += group.pages.length;
    }
  }
  return undefined;
};

const neighbourInPath = (
  path: ReadingPath,
  pageId: string,
  offset: number,
): PageMeta | undefined => {
  const index = path.sequence.findIndex((page) => page.id === pageId);
  return index < 0 ? undefined : path.sequence[index + offset];
};

export const previousInPath = (path: ReadingPath, pageId: string): PageMeta | undefined =>
  neighbourInPath(path, pageId, -1);

export const nextInPath = (path: ReadingPath, pageId: string): PageMeta | undefined =>
  neighbourInPath(path, pageId, 1);

/** First unread page in path order; the first page when everything is read. */
export const firstUnreadIn = (
  pages: readonly PageMeta[],
  readPageIds: ReadPageIds,
): PageMeta | undefined => pages.find((page) => !readPageIds.has(page.id)) ?? pages[0];

export const firstUnreadInPath = (
  path: ReadingPath,
  readPageIds: ReadPageIds,
): PageMeta | undefined => firstUnreadIn(path.sequence, readPageIds);

export const summarizeSection = (
  pathSection: ReadingPathSection,
  readPageIds: ReadPageIds,
): ProgressSummary => summarizeProgress(pathSection.pages, readPageIds);

export const summarizeGroup = (
  group: ReadingPathGroup,
  readPageIds: ReadPageIds,
): ProgressSummary => summarizeProgress(group.pages, readPageIds);
