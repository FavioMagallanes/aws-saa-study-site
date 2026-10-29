import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import {
  byOrder,
  pagesOfDomain,
  summarizeProgress,
  type ProgressSummary,
  type ReadPageIds,
} from '../../content/model/page-progress';

export interface TaskMapPage {
  readonly id: string;
  readonly title: string;
  readonly read: boolean;
}

export interface TaskMap {
  readonly id: string;
  readonly title: string;
  readonly pages: readonly TaskMapPage[];
  readonly readCount: number;
}

export interface DomainMap {
  readonly id: number;
  readonly title: string;
  readonly weight: number;
  readonly tasks: readonly TaskMap[];
  readonly summary: ProgressSummary;
}

export const buildExamMap = (
  pages: readonly PageMeta[],
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): DomainMap[] =>
  guide.domains.map((domain) => {
    const tasks = guide.tasks
      .filter((task) => task.id.startsWith(`${String(domain.id)}.`))
      .map((task): TaskMap => {
        const taskPages = pages
          .filter((page) => page.covers.some((bulletId) => bulletId.startsWith(`${task.id}-`)))
          .sort(byOrder)
          .map((page) => ({ id: page.id, title: page.title, read: readPageIds.has(page.id) }));
        return {
          id: task.id,
          title: task.title,
          pages: taskPages,
          readCount: taskPages.filter((page) => page.read).length,
        };
      });
    return {
      id: domain.id,
      title: domain.title,
      weight: domain.weight,
      tasks,
      summary: summarizeProgress(pagesOfDomain(pages, domain.id), readPageIds),
    };
  });
