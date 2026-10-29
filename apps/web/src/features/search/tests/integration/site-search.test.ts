import { describe, expect, it } from 'vitest';
import { siteSearch } from '../../data/page-search';

const groupLabels = (query: string) => siteSearch.search(query).map((group) => group.label);
const resultsIn = (query: string, label: string) =>
  siteSearch.search(query).find((group) => group.label === label)?.results ?? [];

describe('grouped site search over the real content and glossary', () => {
  it('groups the results as Siglas, Páginas and En el texto, in that order', () => {
    expect(groupLabels('S3')).toEqual(['Siglas', 'Páginas', 'En el texto']);
  });

  it('leaves out the groups without results', () => {
    expect(groupLabels('Amazon CloudFront')).not.toContain('Siglas');
    expect(groupLabels('zxqwvplk')).toEqual([]);
    expect(groupLabels('   ')).toEqual([]);
  });

  it('finds glossary entries by abbreviation and opens them in the glossary', () => {
    expect(resultsIn('S3', 'Siglas')).toEqual([
      {
        key: 'abbreviation:s3',
        title: 'S3',
        context: 'Amazon Simple Storage Service',
        summary: '',
        target: { kind: 'abbreviation', entryId: 's3' },
      },
    ]);
  });

  it('ranks the exact abbreviation first, then abbreviations starting with the query', () => {
    expect(resultsIn('ec', 'Siglas').map((result) => result.title)).toEqual(['EC2', 'ECR', 'ECS']);
    expect(resultsIn('ec2', 'Siglas').map((result) => result.title)).toEqual(['EC2']);
  });

  it('finds glossary entries by a word of the full name, ignoring accents and case', () => {
    expect(resultsIn('recuperacion', 'Siglas').map((result) => result.title)).toEqual([
      'DR',
      'RPO',
      'RTO',
    ]);
  });

  it('keeps the page results as before', () => {
    const [first] = resultsIn('Amazon S3', 'Páginas');
    expect(first).toEqual({
      key: 'page:amazon-s3',
      title: 'Amazon S3',
      context: 'Almacenamiento',
      summary: expect.stringContaining('Amazon S3 (Simple Storage Service)') as unknown,
      target: { kind: 'page', pageId: 'amazon-s3' },
    });
  });

  it('finds headings of written pages as "Page title › Heading", linking to the heading id', () => {
    expect(resultsIn('pago a cargo del solicitante', 'En el texto')).toContainEqual({
      key: 'heading:amazon-s3#buckets-con-pago-a-cargo-del-solicitante-requester-pays',
      title: 'Amazon S3 › Buckets con pago a cargo del solicitante (Requester Pays)',
      context: 'Almacenamiento',
      summary: '',
      target: {
        kind: 'heading',
        pageId: 'amazon-s3',
        headingId: 'buckets-con-pago-a-cargo-del-solicitante-requester-pays',
      },
    });
  });

  it('includes h3 headings', () => {
    expect(resultsIn('Relacionales y no relacionales', 'En el texto')).toContainEqual(
      expect.objectContaining({
        target: {
          kind: 'heading',
          pageId: 'tipos-de-bases-de-datos',
          headingId: 'relacionales-y-no-relacionales',
        },
      }),
    );
  });

  it('never lists the "Fuentes oficiales" section', () => {
    const headingIds = resultsIn('Fuentes oficiales', 'En el texto').map((result) =>
      result.target.kind === 'heading' ? result.target.headingId : '',
    );
    expect(headingIds).not.toContain('fuentes-oficiales');
  });
});
