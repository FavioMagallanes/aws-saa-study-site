import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';

export type ReadPageIds = ReadonlySet<string>;

export interface ProgressSummary {
  readonly total: number;
  readonly read: number;
  readonly percentage: number;
}

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

const percentageOf = (read: number, total: number): number =>
  total === 0 ? 0 : Math.round((read / total) * 100);

const byOrder = (a: PageMeta, b: PageMeta): number => a.order - b.order;

export const summarizeProgress = (
  pages: readonly PageMeta[],
  readPageIds: ReadPageIds,
): ProgressSummary => {
  const read = pages.filter((page) => readPageIds.has(page.id)).length;
  return { total: pages.length, read, percentage: percentageOf(read, pages.length) };
};

export const nextPageToRead = (
  pages: readonly PageMeta[],
  readPageIds: ReadPageIds,
): PageMeta | undefined => {
  const ordered = [...pages].sort(byOrder);
  return ordered.find((page) => !readPageIds.has(page.id)) ?? ordered[0];
};

const pageDomains = (page: PageMeta): Set<number> =>
  new Set(page.covers.map((bulletId) => Number(bulletId.charAt(0))));

export const pagesOfDomain = (pages: readonly PageMeta[], domainId: number): PageMeta[] =>
  pages.filter((page) => pageDomains(page).has(domainId));

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
