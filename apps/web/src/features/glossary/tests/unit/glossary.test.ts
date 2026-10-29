import { describe, expect, it } from 'vitest';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { ALPHABET, filterGlossary, groupByLetter } from '../../model/glossary';

const entry = (abbreviation: string, fullName: string): GlossaryEntry => ({
  id: abbreviation.toLowerCase(),
  abbreviation,
  fullName,
  definition: 'Definición de prueba suficientemente larga.',
  source: { title: 'Fuente', url: 'https://docs.aws.amazon.com/x' },
  pages: [],
});

const entries = [
  entry('EC2', 'Amazon Elastic Compute Cloud'),
  entry('RPO', 'Recovery point objective · objetivo de punto de recuperación'),
  entry('ACM', 'AWS Certificate Manager'),
];

describe('filterGlossary', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterGlossary(entries, '   ')).toHaveLength(3);
  });

  it('matches the abbreviation ignoring case', () => {
    expect(filterGlossary(entries, 'ec2').map((e) => e.abbreviation)).toEqual(['EC2']);
  });

  it('matches the full name ignoring accents', () => {
    expect(filterGlossary(entries, 'recuperacion').map((e) => e.abbreviation)).toEqual(['RPO']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterGlossary(entries, 'zzz')).toEqual([]);
  });
});

describe('groupByLetter', () => {
  it('groups by initial and orders the groups alphabetically', () => {
    const groups = groupByLetter(entries);
    expect(groups.map((group) => group.letter)).toEqual(['A', 'E', 'R']);
  });
});

describe('ALPHABET', () => {
  it('has the 26 letters from A to Z', () => {
    expect(ALPHABET).toHaveLength(26);
    expect([ALPHABET[0], ALPHABET[25]]).toEqual(['A', 'Z']);
  });
});
