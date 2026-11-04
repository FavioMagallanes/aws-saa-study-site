import type { PageKind, PageMeta } from '@arquitecto/contracts/content';
import { byOrder, type ReadPageIds } from '../../content/model/page-progress';
import type { ReviewDigest } from '../scripts/extract-review-digest';

export interface ReviewEntry {
  readonly page: PageMeta;
  readonly digest: ReviewDigest;
}

export interface ReviewGroup {
  readonly kind: PageKind;
  readonly label: string;
  readonly entries: readonly ReviewEntry[];
}

const GROUPS: readonly { readonly kind: PageKind; readonly label: string }[] = [
  { kind: 'fundamental', label: 'Fundamentos' },
  { kind: 'topic', label: 'Arquitecturas' },
  { kind: 'service', label: 'Servicios' },
];

export const buildReview = (
  pages: readonly PageMeta[],
  digests: Readonly<Record<string, ReviewDigest>>,
  readPageIds: ReadPageIds,
): ReviewGroup[] =>
  GROUPS.flatMap(({ kind, label }) => {
    const entries = pages
      .filter((page) => page.kind === kind && readPageIds.has(page.id))
      .sort(byOrder)
      .flatMap((page): ReviewEntry[] => {
        const digest = digests[page.id];
        return digest ? [{ page, digest }] : [];
      });
    return entries.length > 0 ? [{ kind, label, entries }] : [];
  });
