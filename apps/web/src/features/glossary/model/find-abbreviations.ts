import type { GlossaryEntry } from '@arquitecto/contracts/glossary';

export interface AbbreviationMatch {
  readonly index: number;
  readonly text: string;
  readonly entry: GlossaryEntry;
}

// Abbreviations that are also ordinary words in Spanish technical text only count with their
// qualifier: "RAM" alone usually means computer memory, while the glossary entry is AWS RAM.
const REQUIRED_PREFIXES: Readonly<Record<string, string>> = { RAM: 'AWS ' };

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const patternCache = new WeakMap<readonly GlossaryEntry[], RegExp>();

const patternFor = (entries: readonly GlossaryEntry[]): RegExp => {
  const cached = patternCache.get(entries);
  if (cached) return cached;
  const alternatives = entries
    .map((entry) => entry.abbreviation)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, 'gu');
  patternCache.set(entries, pattern);
  return pattern;
};

export const findAbbreviations = (
  text: string,
  entries: readonly GlossaryEntry[],
): AbbreviationMatch[] => {
  if (entries.length === 0) return [];
  const byAbbreviation = new Map(entries.map((entry) => [entry.abbreviation, entry]));
  return [...text.matchAll(patternFor(entries))].flatMap((match) => {
    const entry = byAbbreviation.get(match[0]);
    const prefix = REQUIRED_PREFIXES[match[0]];
    if (!entry || (prefix !== undefined && !text.slice(0, match.index).endsWith(prefix))) {
      return [];
    }
    return [{ index: match.index, text: match[0], entry }];
  });
};
