import { describe, expect, it } from 'vitest';
import { glossaryEntrySchema } from '../src/content/glossary-entry.ts';

const valid = {
  id: 'acm',
  abbreviation: 'ACM',
  fullName: 'AWS Certificate Manager',
  definition: 'Crea, almacena y renueva certificados SSL/TLS para cifrar datos en tránsito.',
  source: {
    title: 'Qué es AWS Certificate Manager',
    url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html',
  },
  pages: ['aws-certificate-manager-acm'],
};

describe('glossary entry contract', () => {
  it('accepts an entry sourced from docs.aws.amazon.com', () => {
    expect(glossaryEntrySchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    'https://aws.amazon.com/certificate-manager/',
    'http://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html',
    'https://docs.aws.amazon.com.evil.example/acm',
    'not a url',
  ])('rejects the source %s', (url) => {
    const entry = { ...valid, source: { ...valid.source, url } };
    expect(glossaryEntrySchema.safeParse(entry).success).toBe(false);
  });

  it('rejects an empty definition', () => {
    expect(glossaryEntrySchema.safeParse({ ...valid, definition: '' }).success).toBe(false);
  });
});
