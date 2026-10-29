import MiniSearch from 'minisearch';

export interface SearchDocument {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly headings: string;
  readonly summary: string;
  readonly bullets: string;
  readonly abbreviations: string;
}

export interface SearchHit {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
}

export interface PageSearch {
  readonly search: (query: string) => SearchHit[];
}

// Short Spanish function words would otherwise prefix-match almost every page.
const STOP_WORDS = new Set([
  'a',
  'al',
  'con',
  'de',
  'del',
  'el',
  'en',
  'la',
  'las',
  'lo',
  'los',
  'o',
  'para',
  'por',
  'su',
  'un',
  'una',
  'y',
]);

export const normalizeSearchText = (text: string): string =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// "S3" and "Amazon S3" both name the Amazon S3 page, so the vendor prefix is ignored.
const toNameKey = (text: string): string =>
  normalizeSearchText(text)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(amazon|aws)\s+/, '');

const processTerm = (term: string): string | null => {
  const normalized = normalizeSearchText(term);
  return STOP_WORDS.has(normalized) ? null : normalized;
};

export const createPageSearch = (documents: readonly SearchDocument[]): PageSearch => {
  const index = new MiniSearch<SearchDocument>({
    fields: ['title', 'abbreviations', 'category', 'headings', 'summary', 'bullets'],
    processTerm,
    searchOptions: {
      boost: { title: 10, abbreviations: 6, category: 2, headings: 2, summary: 1, bullets: 0.5 },
      prefix: true,
      fuzzy: 0.2,
      maxFuzzy: 2,
      combineWith: 'AND',
    },
  });
  index.addAll([...documents]);

  const hitsById = new Map(
    documents.map((document): [string, SearchHit] => [
      document.id,
      {
        id: document.id,
        title: document.title,
        category: document.category,
        summary: document.summary,
      },
    ]),
  );

  const search = (query: string): SearchHit[] => {
    if (query.trim() === '') return [];
    const hits = index
      .search(query)
      .map((result) => hitsById.get(String(result.id)))
      .filter((hit): hit is SearchHit => hit !== undefined);
    // A page named exactly like the query goes first, even when longer pages repeat the term.
    const queryKey = toNameKey(query);
    const named = hits.filter((hit) => toNameKey(hit.title) === queryKey);
    return [...named, ...hits.filter((hit) => !named.includes(hit))];
  };

  return { search };
};
