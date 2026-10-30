import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import type { ReadPageIds } from '../../content/model/page-progress';

export interface IndexedService {
  readonly name: string;
  readonly pageId: string;
  readonly read: boolean;
}

export interface ServiceCategory {
  readonly name: string;
  readonly services: readonly IndexedService[];
  readonly readCount: number;
}

const titleCollator = new Intl.Collator('es');

// Categories keep the order of the exam guide; services inside each one are alphabetical by title.
export const buildServiceCategories = (
  pages: readonly PageMeta[],
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): ServiceCategory[] => {
  const pageIdByTitle = new Map(
    pages.filter((page) => page.kind === 'service').map((page) => [page.title, page.id]),
  );
  const categoryNames = [...new Set(guide.services.map((service) => service.category))];
  return categoryNames.map((name) => {
    const services = guide.services
      .filter((service) => service.category === name)
      .flatMap((service): IndexedService[] => {
        const pageId = pageIdByTitle.get(service.name);
        return pageId === undefined
          ? []
          : [{ name: service.name, pageId, read: readPageIds.has(pageId) }];
      })
      .sort((a, b) => titleCollator.compare(a.name, b.name));
    return { name, services, readCount: services.filter((service) => service.read).length };
  });
};

// A service may belong to more than one guide category (Amazon Redshift), so count unique names.
export const countGuideServices = (guide: ExamGuide): number =>
  new Set(guide.services.map((service) => service.name)).size;

export const formatReadCount = (read: number, total: number): string =>
  `${String(read)} de ${String(total)} ${total === 1 ? 'leída' : 'leídas'}`;
