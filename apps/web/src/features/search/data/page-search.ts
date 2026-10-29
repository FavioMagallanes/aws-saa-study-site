import { z } from 'zod';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { examGuide } from '../../content/data/load-exam-guide';
import { loadPages } from '../../content/data/load-pages';
import type { ExamGuide } from '../../content/model/exam-guide';
import { glossary } from '../../glossary/data/load-glossary';
import type { PageText } from '../model/extract-page-text';
import { createPageSearch, type SearchDocument } from '../model/page-search';
import pageSearchTextJson from './page-search-text.json';

const pageTextSchema = z.record(
  z.string(),
  z.object({ headings: z.array(z.string()), summary: z.string() }),
);

const KIND_LABELS = {
  fundamental: 'Fundamentos',
  topic: 'Arquitecturas',
  service: 'Servicios',
} as const;

const bulletTextById = (guide: ExamGuide): ReadonlyMap<string, string> =>
  new Map(
    guide.tasks.flatMap((task) =>
      [...task.knowledge, ...task.skills].map((bullet): [string, string] => [
        bullet.id,
        bullet.text,
      ]),
    ),
  );

export const buildSearchDocuments = (
  pages: readonly PageMeta[],
  pageText: Readonly<Record<string, PageText>>,
  guide: ExamGuide,
  entries: readonly GlossaryEntry[],
): SearchDocument[] => {
  const bullets = bulletTextById(guide);
  return pages.map((page) => {
    const text = pageText[page.id];
    return {
      id: page.id,
      title: page.title,
      category: page.category ?? KIND_LABELS[page.kind],
      headings: text?.headings.join('\n') ?? '',
      summary: text?.summary ?? '',
      bullets: page.covers.map((id) => bullets.get(id) ?? '').join('\n'),
      abbreviations: entries
        .filter((entry) => entry.pages.includes(page.id))
        .map((entry) => `${entry.abbreviation} ${entry.fullName}`)
        .join('\n'),
    };
  });
};

export const pageSearch = createPageSearch(
  buildSearchDocuments(loadPages(), pageTextSchema.parse(pageSearchTextJson), examGuide, glossary),
);
