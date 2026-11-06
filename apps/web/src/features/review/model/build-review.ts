import type { PageKind, PageMeta } from '@arquitecto/contracts/content';
import type { ReadPageIds } from '../../content/model/page-progress';
import type { ReviewDigest } from '../scripts/extract-review-digest';
import { groupReadPages } from './group-read-pages';

export interface ReviewEntry {
  readonly page: PageMeta;
  readonly digest: ReviewDigest;
}

export interface ReviewGroup {
  readonly kind: PageKind;
  readonly label: string;
  readonly entries: readonly ReviewEntry[];
}

export const buildReview = (
  pages: readonly PageMeta[],
  digests: Readonly<Record<string, ReviewDigest>>,
  readPageIds: ReadPageIds,
): ReviewGroup[] =>
  groupReadPages(pages, readPageIds).flatMap(({ kind, label, pages: groupPages }) => {
    const entries = groupPages.flatMap((page): ReviewEntry[] => {
      const digest = digests[page.id];
      return digest ? [{ page, digest }] : [];
    });
    return entries.length > 0 ? [{ kind, label, entries }] : [];
  });
