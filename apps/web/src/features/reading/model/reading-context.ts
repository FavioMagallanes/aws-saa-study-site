import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import type { ReadPageIds } from '../../content/model/page-progress';
import {
  nextInPath,
  pathPosition,
  previousInPath,
  summarizeSection,
  type PathPosition,
  type ReadingPath,
} from '../../content/model/reading-path';

export interface SidebarPage {
  readonly id: string;
  readonly title: string;
  readonly read: boolean;
  readonly current: boolean;
}

export interface SidebarGroup {
  readonly id: string;
  /** Undefined when the section has a single group that its own title already names. */
  readonly label: string | undefined;
  readonly current: boolean;
  readonly pages: readonly SidebarPage[];
}

export interface SidebarSection {
  readonly id: string;
  readonly title: string;
  readonly open: boolean;
  readonly read: number;
  readonly total: number;
  readonly groups: readonly SidebarGroup[];
}

export interface PagerTarget {
  readonly page: PageMeta;
  /** Where the neighbour leads when it is in another group or section of the path. */
  readonly destination: string | undefined;
}

export interface ReadingContext {
  readonly breadcrumb: readonly string[];
  readonly examTasks: readonly { readonly id: string; readonly title: string }[];
  readonly sidebarSections: readonly SidebarSection[];
  readonly previous: PagerTarget | undefined;
  readonly next: PagerTarget | undefined;
}

const taskIdOf = (bulletId: string): string => bulletId.slice(0, bulletId.indexOf('-'));

const taskIdsOf = (page: PageMeta): string[] =>
  [...new Set(page.covers.map(taskIdOf))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

const describeDestination = (
  from: PathPosition | undefined,
  to: PathPosition,
): string | undefined => {
  const servicesLabel = `${to.section.title} · ${to.group.label}`;
  if (from?.section.id !== to.section.id) {
    return to.section.kind === 'services' ? servicesLabel : to.section.title;
  }
  if (from.group.id === to.group.id) return undefined;
  return to.section.kind === 'services' ? servicesLabel : to.group.label;
};

const toPagerTarget = (
  path: ReadingPath,
  current: PathPosition | undefined,
  page: PageMeta | undefined,
): PagerTarget | undefined => {
  if (!page) return undefined;
  const position = pathPosition(path, page.id);
  return {
    page,
    destination: position ? describeDestination(current, position) : undefined,
  };
};

export const buildReadingContext = (
  page: PageMeta,
  path: ReadingPath,
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): ReadingContext => {
  const position = pathPosition(path, page.id);
  const examTasks = taskIdsOf(page).flatMap((id) => {
    const task = guide.tasks.find((candidate) => candidate.id === id);
    return task ? [{ id, title: task.title }] : [];
  });

  const sidebarSections = path.sections.map((section): SidebarSection => {
    const summary = summarizeSection(section, readPageIds);
    return {
      id: section.id,
      title: section.title,
      open: section.id === position?.section.id,
      read: summary.read,
      total: summary.total,
      groups: section.groups.map((group) => ({
        id: group.id,
        label: section.kind === 'fundamentals' ? undefined : group.label,
        current: section.id === position?.section.id && group.id === position.group.id,
        pages: group.pages.map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          read: readPageIds.has(candidate.id),
          current: candidate.id === page.id,
        })),
      })),
    };
  });

  const breadcrumb = !position
    ? []
    : position.section.kind === 'fundamentals'
      ? [position.section.crumb]
      : [position.section.crumb, position.group.crumb];

  return {
    breadcrumb,
    examTasks,
    sidebarSections,
    previous: toPagerTarget(path, position, previousInPath(path, page.id)),
    next: toPagerTarget(path, position, nextInPath(path, page.id)),
  };
};
