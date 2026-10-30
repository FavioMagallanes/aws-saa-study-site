import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from '../../content/model/exam-guide';
import {
  byOrder,
  summarizeProgress,
  type ProgressSummary,
  type ReadPageIds,
} from '../../content/model/page-progress';

// Topic pages are grouped by their category, one per exam domain.
export const TOPIC_CATEGORY_BY_DOMAIN: Readonly<Record<number, string>> = {
  1: 'Seguridad',
  2: 'Resiliencia',
  3: 'Rendimiento',
  4: 'Costos',
};

export interface IndexedTopic {
  readonly title: string;
  readonly pageId: string;
  readonly read: boolean;
}

export interface TopicDomain {
  readonly id: number;
  readonly title: string;
  readonly weight: number;
  readonly topics: readonly IndexedTopic[];
  readonly summary: ProgressSummary;
}

export const topicPages = (pages: readonly PageMeta[]): PageMeta[] =>
  pages.filter((page) => page.kind === 'topic');

export const buildTopicDomains = (
  pages: readonly PageMeta[],
  guide: ExamGuide,
  readPageIds: ReadPageIds,
): TopicDomain[] => {
  const topics = topicPages(pages);
  return guide.domains.map((domain) => {
    const domainTopics = topics
      .filter((page) => page.category === TOPIC_CATEGORY_BY_DOMAIN[domain.id])
      .sort(byOrder);
    return {
      id: domain.id,
      title: domain.title,
      weight: domain.weight,
      topics: domainTopics.map((page) => ({
        title: page.title,
        pageId: page.id,
        read: readPageIds.has(page.id),
      })),
      summary: summarizeProgress(domainTopics, readPageIds),
    };
  });
};

export const formatTopicReadCount = (read: number, total: number): string =>
  `${String(read)} de ${String(total)} ${total === 1 ? 'leído' : 'leídos'}`;
