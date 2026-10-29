import type { GlossaryEntry } from '@arquitecto/contracts/glossary';

export interface GlossaryGroup {
  readonly letter: string;
  readonly entries: readonly GlossaryEntry[];
}

export const ALPHABET: readonly string[] = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const filterGlossary = (
  entries: readonly GlossaryEntry[],
  query: string,
): GlossaryEntry[] => {
  const needle = normalize(query.trim());
  if (needle === '') return [...entries];
  return entries.filter(
    (entry) =>
      normalize(entry.abbreviation).includes(needle) || normalize(entry.fullName).includes(needle),
  );
};

export const groupByLetter = (entries: readonly GlossaryEntry[]): GlossaryGroup[] => {
  const groups = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    const letter = entry.abbreviation.charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, items]) => ({ letter, entries: items }));
};
