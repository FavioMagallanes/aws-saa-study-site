import MiniSearch from 'minisearch';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { normalizeSearchText, processTerm, type PageSearch } from './page-search';

export type SearchTarget =
  | { readonly kind: 'abbreviation'; readonly entryId: string }
  | { readonly kind: 'page'; readonly pageId: string }
  | { readonly kind: 'heading'; readonly pageId: string; readonly headingId: string };

export interface SearchResult {
  readonly key: string;
  readonly title: string;
  readonly context: string;
  readonly summary: string;
  readonly target: SearchTarget;
}

export type SearchGroupId = 'abbreviations' | 'pages' | 'headings';

export interface SearchGroup {
  readonly id: SearchGroupId;
  readonly label: string;
  readonly results: readonly SearchResult[];
}

export interface HeadingDocument {
  readonly pageId: string;
  readonly pageTitle: string;
  readonly category: string;
  readonly headingId: string;
  readonly heading: string;
}

export interface SiteSearch {
  readonly search: (query: string) => SearchGroup[];
}

// Generic section names ("Cómo elegir", "Conceptos clave") repeat on every page.
const MAX_HEADING_RESULTS = 20;

const wordsOf = (text: string): string[] =>
  normalizeSearchText(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== '');

// Every query word must start a word of the abbreviation or the full name.
const matchesEntry = (entry: GlossaryEntry, queryWords: readonly string[]): boolean => {
  const words = wordsOf(`${entry.abbreviation} ${entry.fullName}`);
  return queryWords.every((queryWord) => words.some((word) => word.startsWith(queryWord)));
};

const abbreviationRank = (entry: GlossaryEntry, query: string): number => {
  const abbreviation = normalizeSearchText(entry.abbreviation);
  if (abbreviation === query) return 0;
  return abbreviation.startsWith(query) ? 1 : 2;
};

const searchAbbreviations = (entries: readonly GlossaryEntry[], query: string): SearchResult[] => {
  const queryWords = wordsOf(query);
  const normalizedQuery = normalizeSearchText(query.trim());
  return entries
    .filter((entry) => matchesEntry(entry, queryWords))
    .map((entry) => ({ entry, rank: abbreviationRank(entry, normalizedQuery) }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ entry }): SearchResult => ({
      key: `abbreviation:${entry.id}`,
      title: entry.abbreviation,
      context: entry.fullName,
      summary: '',
      target: { kind: 'abbreviation', entryId: entry.id },
    }));
};

const createHeadingSearch = (documents: readonly HeadingDocument[]) => {
  const keyOf = (document: HeadingDocument) => `${document.pageId}#${document.headingId}`;
  // A repeated heading in one page shares its id, so the first one wins (as in the page itself).
  const byKey = new Map<string, HeadingDocument>();
  for (const document of documents) {
    if (!byKey.has(keyOf(document))) byKey.set(keyOf(document), document);
  }
  const index = new MiniSearch<{ readonly id: string; readonly heading: string }>({
    fields: ['heading'],
    processTerm,
    searchOptions: { prefix: true, fuzzy: 0.2, maxFuzzy: 2, combineWith: 'AND' },
  });
  index.addAll([...byKey].map(([id, document]) => ({ id, heading: document.heading })));

  return (query: string): SearchResult[] =>
    index
      .search(query)
      .slice(0, MAX_HEADING_RESULTS)
      .map((result) => byKey.get(String(result.id)))
      .filter((document): document is HeadingDocument => document !== undefined)
      .map((document): SearchResult => ({
        key: `heading:${keyOf(document)}`,
        title: `${document.pageTitle} › ${document.heading}`,
        context: document.category,
        summary: '',
        target: { kind: 'heading', pageId: document.pageId, headingId: document.headingId },
      }));
};

export const createSiteSearch = (
  pageSearch: PageSearch,
  headings: readonly HeadingDocument[],
  glossary: readonly GlossaryEntry[],
): SiteSearch => {
  const searchHeadings = createHeadingSearch(headings);

  const search = (query: string): SearchGroup[] => {
    if (query.trim() === '') return [];
    const groups: SearchGroup[] = [
      { id: 'abbreviations', label: 'Siglas', results: searchAbbreviations(glossary, query) },
      {
        id: 'pages',
        label: 'Páginas',
        results: pageSearch.search(query).map((hit): SearchResult => ({
          key: `page:${hit.id}`,
          title: hit.title,
          context: hit.category,
          summary: hit.summary,
          target: { kind: 'page', pageId: hit.id },
        })),
      },
      { id: 'headings', label: 'En el texto', results: searchHeadings(query) },
    ];
    return groups.filter((group) => group.results.length > 0);
  };

  return { search };
};
