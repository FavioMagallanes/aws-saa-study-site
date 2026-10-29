import type { PageMeta } from '@arquitecto/contracts/content';

export type ReadPageIds = ReadonlySet<string>;

export interface ProgressSummary {
  readonly total: number;
  readonly read: number;
  readonly percentage: number;
}

export const percentageOf = (read: number, total: number): number =>
  total === 0 ? 0 : Math.round((read / total) * 100);

export const byOrder = (a: PageMeta, b: PageMeta): number => a.order - b.order;

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
