import type { PageMeta } from '@arquitecto/contracts/content';
import { describe, expect, it } from 'vitest';
import { buildReview } from '../../model/build-review';
import type { ReviewDigest } from '../../scripts/extract-review-digest';

const page = (id: string, kind: PageMeta['kind'], order: number): PageMeta => ({
  id,
  order,
  title: id.toUpperCase(),
  kind,
  covers: [],
});

const digest: ReviewDigest = { intro: 'i', problem: 'p', concepts: [], whenToUse: [] };
const pages = [page('s3', 'service', 3), page('vpc', 'fundamental', 2), page('ec2', 'service', 1)];
const digests = { s3: digest, vpc: digest, ec2: digest };

describe('buildReview', () => {
  it('keeps only the pages that were read, grouped by kind and sorted by order', () => {
    const groups = buildReview(pages, digests, new Set(['s3', 'ec2', 'vpc']));
    expect(
      groups.map((group) => [group.label, group.entries.map((entry) => entry.page.id)]),
    ).toEqual([
      ['Fundamentos', ['vpc']],
      ['Servicios', ['ec2', 's3']],
    ]);
  });

  it('returns nothing when no page was read, and skips read pages without a digest', () => {
    expect(buildReview(pages, digests, new Set())).toEqual([]);
    expect(buildReview(pages, {}, new Set(['s3']))).toEqual([]);
  });
});
