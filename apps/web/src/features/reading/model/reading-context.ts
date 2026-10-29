import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import { DOMAIN_SHORT_TITLES } from '../../content/model/domain-labels';
import { byOrder, type ReadPageIds } from '../../content/model/page-progress';

export interface SidebarPage {
  readonly id: string;
  readonly title: string;
  readonly read: boolean;
  readonly current: boolean;
}

export interface SidebarGroup {
  readonly label: string | undefined;
  readonly pages: readonly SidebarPage[];
}

export interface ReadingContext {
  readonly breadcrumb: readonly string[];
  readonly examTasks: readonly { readonly id: string; readonly title: string }[];
  readonly sidebarHeading: string;
  readonly sidebarGroups: readonly SidebarGroup[];
  readonly previous: PageMeta | undefined;
  readonly next: PageMeta | undefined;
}

const KIND_ROOT = {
  fundamental: 'Fundamentos',
  topic: 'Arquitecturas',
  service: 'Servicios',
} as const;

const taskIdOf = (bulletId: string): string => bulletId.slice(0, bulletId.indexOf('-'));

const toSidebarPage = (page: PageMeta, current: PageMeta, read: ReadPageIds): SidebarPage => ({
  id: page.id,
  title: page.title,
  read: read.has(page.id),
  current: page.id === current.id,
});

const taskIdsOf = (page: PageMeta): string[] =>
  [...new Set(page.covers.map(taskIdOf))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

export const buildReadingContext = (
  page: PageMeta,
  pages: readonly PageMeta[],
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): ReadingContext => {
  const ordered = [...pages].sort(byOrder);
  const index = ordered.findIndex((candidate) => candidate.id === page.id);
  const taskIds = taskIdsOf(page);
  const examTasks = taskIds.flatMap((id) => {
    const task = guide.tasks.find((candidate) => candidate.id === id);
    return task ? [{ id, title: task.title }] : [];
  });

  const primaryTaskId = taskIds[0];
  const domainId = primaryTaskId === undefined ? undefined : Number(primaryTaskId.charAt(0));
  const domain = guide.domains.find((candidate) => candidate.id === domainId);

  let sidebarHeading: string;
  let sidebarGroups: SidebarGroup[];

  if (domain && primaryTaskId !== undefined) {
    sidebarHeading = `Dominio ${String(domain.id)} · ${DOMAIN_SHORT_TITLES[domain.id] ?? domain.title}`;
    sidebarGroups = guide.tasks
      .filter((task) => task.id.startsWith(`${String(domain.id)}.`))
      .map((task) => ({
        label: `Tarea ${task.id} · ${task.title}`,
        pages:
          task.id === primaryTaskId
            ? ordered
                .filter((candidate) =>
                  candidate.covers.some((bulletId) => bulletId.startsWith(`${task.id}-`)),
                )
                .map((candidate) => toSidebarPage(candidate, page, readPageIds))
            : [],
      }));
  } else {
    sidebarHeading = page.category ?? KIND_ROOT[page.kind];
    sidebarGroups = [
      {
        label: undefined,
        pages: ordered
          .filter(
            (candidate) => candidate.kind === page.kind && candidate.category === page.category,
          )
          .map((candidate) => toSidebarPage(candidate, page, readPageIds)),
      },
    ];
  }

  return {
    breadcrumb: page.category ? [KIND_ROOT[page.kind], page.category] : [KIND_ROOT[page.kind]],
    examTasks,
    sidebarHeading,
    sidebarGroups,
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: ordered[index + 1],
  };
};
