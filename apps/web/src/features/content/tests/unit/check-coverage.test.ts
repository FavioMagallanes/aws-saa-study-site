import { describe, expect, it } from 'vitest';
import type { PageMeta } from '@arquitecto/contracts/content';
import { checkCoverage } from '../../model/check-coverage';
import type { ExamGuide } from '../../model/exam-guide';

const guide: ExamGuide = {
  domains: [{ id: 1, title: 'Domain', weight: 100 }],
  tasks: [
    {
      id: '1.1',
      title: 'Task',
      knowledge: [{ id: '1.1-k1', text: 'A' }],
      skills: [{ id: '1.1-s1', text: 'B' }],
    },
  ],
  services: [{ category: 'Cat', name: 'Amazon SQS' }],
};

const page = (overrides: Partial<PageMeta>): PageMeta => ({
  id: 'amazon-sqs',
  order: 1,
  title: 'Amazon SQS',
  kind: 'service',
  covers: [],
  ...overrides,
});

describe('checkCoverage', () => {
  it('reports no problems when every bullet and service is covered', () => {
    const report = checkCoverage([page({ covers: ['1.1-k1', '1.1-s1'] })], guide);
    expect(report).toEqual({
      uncoveredBullets: [],
      unknownBullets: [],
      servicesWithoutPage: [],
      duplicatedPageIds: [],
    });
  });

  it('reports a guide bullet that no page covers', () => {
    expect(checkCoverage([page({ covers: ['1.1-k1'] })], guide).uncoveredBullets).toEqual([
      '1.1-s1',
    ]);
  });

  it('reports a bullet id that is not in the guide', () => {
    expect(
      checkCoverage([page({ covers: ['1.1-k1', '1.1-s1', '9.9-k1'] })], guide).unknownBullets,
    ).toEqual(['9.9-k1']);
  });

  it('reports an in-scope service without a service page', () => {
    const report = checkCoverage([page({ kind: 'topic', covers: ['1.1-k1', '1.1-s1'] })], guide);
    expect(report.servicesWithoutPage).toEqual(['Amazon SQS']);
  });

  it('reports duplicated page ids', () => {
    expect(checkCoverage([page({}), page({})], guide).duplicatedPageIds).toEqual(['amazon-sqs']);
  });
});
