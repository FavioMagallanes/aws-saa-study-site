import type { PageMeta } from '@arquitecto/contracts/content';
import type { ExamGuide } from './exam-guide';

export interface CoverageReport {
  readonly uncoveredBullets: readonly string[];
  readonly unknownBullets: readonly string[];
  readonly servicesWithoutPage: readonly string[];
  readonly duplicatedPageIds: readonly string[];
}

export const checkCoverage = (pages: readonly PageMeta[], guide: ExamGuide): CoverageReport => {
  const guideBulletIds = new Set(
    guide.tasks.flatMap((task) => [...task.knowledge, ...task.skills].map((bullet) => bullet.id)),
  );
  const coveredBullets = new Set(pages.flatMap((page) => page.covers));
  const servicePages = new Set(
    pages.filter((page) => page.kind === 'service').map((page) => page.title),
  );

  const seenIds = new Set<string>();
  const duplicatedPageIds = new Set<string>();
  for (const page of pages) {
    if (seenIds.has(page.id)) duplicatedPageIds.add(page.id);
    seenIds.add(page.id);
  }

  return {
    uncoveredBullets: [...guideBulletIds].filter((id) => !coveredBullets.has(id)),
    unknownBullets: [...coveredBullets].filter((id) => !guideBulletIds.has(id)),
    servicesWithoutPage: guide.services
      .map((service) => service.name)
      .filter((name) => !servicePages.has(name)),
    duplicatedPageIds: [...duplicatedPageIds],
  };
};
