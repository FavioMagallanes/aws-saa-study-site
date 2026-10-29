import { describe, expect, it } from 'vitest';
import { pageSearch } from '../../data/page-search';

const idsFor = (query: string) => pageSearch.search(query).map((hit) => hit.id);

describe('page search over the real content', () => {
  it('ranks the page whose title matches first', () => {
    const [first] = pageSearch.search('Amazon S3');
    expect(first).toEqual({
      id: 'amazon-s3',
      title: 'Amazon S3',
      category: 'Almacenamiento',
      summary: expect.stringContaining('Amazon S3 (Simple Storage Service)') as unknown,
    });
  });

  it('puts the page named like the query first, with or without the vendor prefix', () => {
    expect(idsFor('S3')[0]).toBe('amazon-s3');
    expect(idsFor('ec2')[0]).toBe('amazon-ec2');
  });

  it('matches word prefixes', () => {
    expect(idsFor('dynam')).toContain('amazon-dynamodb');
  });

  it('tolerates a small typo', () => {
    expect(idsFor('dynamdb')).toContain('amazon-dynamodb');
  });

  it('ignores accents and letter case', () => {
    const accented = idsFor('Multirregión');
    expect(accented).toContain('alta-disponibilidad-multi-az-y-multirregion');
    expect(idsFor('multirregion')).toEqual(accented);
  });

  it('finds a page by one of its headings', () => {
    expect(idsFor('pago a cargo del solicitante')).toContain('amazon-s3');
  });

  it('finds a page by a glossary abbreviation it explains', () => {
    expect(idsFor('CDN')[0]).toBe('amazon-cloudfront');
  });

  it('finds a page by an exam guide bullet it covers', () => {
    expect(idsFor('identidad y acceso federados')).toContain(
      'iam-usuarios-grupos-roles-politicas-y-mfa',
    );
  });

  it('keeps pending pages findable by title and category, without a summary', () => {
    const hit = pageSearch
      .search('Elastic Transcoder')
      .find((candidate) => candidate.id === 'amazon-elastic-transcoder');
    expect(hit).toEqual({
      id: 'amazon-elastic-transcoder',
      title: 'Amazon Elastic Transcoder',
      category: 'Servicios multimedia',
      summary: '',
    });
    expect(idsFor('servicios multimedia')).toContain('amazon-elastic-transcoder');
  });

  it('returns no results for an empty query or unknown words', () => {
    expect(pageSearch.search('   ')).toEqual([]);
    expect(pageSearch.search('zxqwvplk')).toEqual([]);
  });
});
