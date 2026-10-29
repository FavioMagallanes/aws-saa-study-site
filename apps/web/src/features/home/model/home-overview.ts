import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import {
  nextPageToRead,
  pagesOfDomain,
  summarizeProgress,
  type ProgressSummary,
  type ReadPageIds,
} from '../../content/model/page-progress';

export interface DomainOverview {
  readonly id: number;
  readonly title: string;
  readonly weight: number;
  readonly firstTask: string;
  readonly lastTask: string;
  readonly summary: ProgressSummary;
  readonly startPageId: string | undefined;
}

export interface ServiceCategoryOverview {
  readonly category: string;
  readonly services: readonly {
    readonly name: string;
    readonly pageId: string;
    readonly read: boolean;
  }[];
  readonly hiddenCount: number;
}

export const overviewDomains = (
  pages: readonly PageMeta[],
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): DomainOverview[] =>
  guide.domains.map((domain) => {
    const tasks = guide.tasks.filter((task) => task.id.startsWith(`${String(domain.id)}.`));
    const domainPages = pagesOfDomain(pages, domain.id);
    return {
      id: domain.id,
      title: domain.title,
      weight: domain.weight,
      firstTask: tasks[0]?.id ?? '',
      lastTask: tasks[tasks.length - 1]?.id ?? '',
      summary: summarizeProgress(domainPages, readPageIds),
      startPageId: nextPageToRead(domainPages, readPageIds)?.id,
    };
  });

export const overviewServiceCategories = (
  pages: readonly PageMeta[],
  guide: ExamGuide,
  categoryNames: readonly string[],
  readPageIds: ReadPageIds,
  visibleServices: number,
): ServiceCategoryOverview[] => {
  const servicePages = new Map(
    pages.filter((page) => page.kind === 'service').map((page) => [page.title, page.id]),
  );
  return categoryNames.map((category) => {
    const members = guide.services.filter((service) => service.category === category);
    const linked = members.flatMap((service) => {
      const pageId = servicePages.get(service.name);
      return pageId === undefined
        ? []
        : [{ name: service.name, pageId, read: readPageIds.has(pageId) }];
    });
    return {
      category,
      services: linked.slice(0, visibleServices),
      hiddenCount: Math.max(0, linked.length - visibleServices),
    };
  });
};

export const countCategories = (guide: ExamGuide): number =>
  new Set(guide.services.map((service) => service.category)).size;
