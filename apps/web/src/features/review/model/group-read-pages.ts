import type { PageKind, PageMeta } from '@arquitecto/contracts/content';
import { byOrder, type ReadPageIds } from '../../content/model/page-progress';

export interface ReadPageGroup {
  readonly kind: PageKind;
  readonly label: string;
  readonly pages: readonly PageMeta[];
}

const GROUPS: readonly { readonly kind: PageKind; readonly label: string }[] = [
  { kind: 'fundamental', label: 'Fundamentos' },
  { kind: 'topic', label: 'Arquitecturas' },
  { kind: 'service', label: 'Servicios' },
];

// Read pages by kind, in reading order. Kinds with nothing read are left out.
export const groupReadPages = (
  pages: readonly PageMeta[],
  readPageIds: ReadPageIds,
): ReadPageGroup[] =>
  GROUPS.flatMap(({ kind, label }) => {
    const groupPages = pages
      .filter((page) => page.kind === kind && readPageIds.has(page.id))
      .sort(byOrder);
    return groupPages.length > 0 ? [{ kind, label, pages: groupPages }] : [];
  });
