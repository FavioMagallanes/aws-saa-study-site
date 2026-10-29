import { z } from 'zod';
import type { PageMeta } from '@arquitecto/contracts/content';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { slugifyHeading } from '../../reading/model/heading-id';
import { examGuide } from '../../content/data/load-exam-guide';
import { loadPages } from '../../content/data/load-pages';
import type { ExamGuide } from '../../content/model/exam-guide';
import { glossary } from '../../glossary/data/load-glossary';
import type { PageText } from '../model/extract-page-text';
import { createPageSearch, type SearchDocument } from '../model/page-search';
import { createSiteSearch, type HeadingDocument } from '../model/site-search';
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

// Heading ids match the ones the reading screen renders (reading/model/heading-id.ts).
export const buildHeadingDocuments = (
  pages: readonly PageMeta[],
  pageText: Readonly<Record<string, PageText>>,
): HeadingDocument[] =>
  pages.flatMap((page) =>
    (pageText[page.id]?.headings ?? []).map((heading) => ({
      pageId: page.id,
      pageTitle: page.title,
      category: page.category ?? KIND_LABELS[page.kind],
      headingId: slugifyHeading(heading),
      heading,
    })),
  );

const pages = loadPages();
const pageText = pageTextSchema.parse(pageSearchTextJson);

export const pageSearch = createPageSearch(
  buildSearchDocuments(pages, pageText, examGuide, glossary),
);

export const siteSearch = createSiteSearch(
  pageSearch,
  buildHeadingDocuments(pages, pageText),
  glossary,
);
