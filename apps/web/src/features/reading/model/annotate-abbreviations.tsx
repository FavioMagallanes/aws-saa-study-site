import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { findAbbreviations, type AbbreviationMatch } from '../../glossary/model/find-abbreviations';
import { OfficialSource } from '../components/official-source/official-source';
import { SectionHeading, SubsectionHeading } from './mdx-components';

export type RenderAbbreviation = (match: AbbreviationMatch) => ReactNode;

interface ElementProps {
  readonly children?: ReactNode;
}

// Text inside these elements is never annotated: headings, code, links, existing
// abbreviations, controls and the official source cards.
const SKIPPED_TYPES: ReadonlySet<unknown> = new Set([
  'a',
  'abbr',
  'button',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  SectionHeading,
  SubsectionHeading,
  OfficialSource,
]);

const SECTION_TYPES: ReadonlySet<unknown> = new Set(['h2', SectionHeading]);

const annotateText = (
  text: string,
  entries: readonly GlossaryEntry[],
  seen: Set<string>,
  render: RenderAbbreviation,
): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of findAbbreviations(text, entries)) {
    if (seen.has(match.entry.id)) continue;
    seen.add(match.entry.id);
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(render(match));
    cursor = match.index + match.text.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

const annotateChildren = (
  children: ReactNode,
  entries: readonly GlossaryEntry[],
  seen: Set<string>,
  render: RenderAbbreviation,
): ReactNode[] =>
  Children.toArray(children).flatMap((child) => {
    if (typeof child === 'string') return annotateText(child, entries, seen, render);
    if (!isValidElement<ElementProps>(child)) return [child];
    if (SECTION_TYPES.has(child.type)) seen.clear();
    if (SKIPPED_TYPES.has(child.type) || child.props.children === undefined) return [child];
    return [annotateElement(child, entries, seen, render)];
  });

const annotateElement = (
  element: ReactElement<ElementProps>,
  entries: readonly GlossaryEntry[],
  seen: Set<string>,
  render: RenderAbbreviation,
): ReactElement<ElementProps> =>
  cloneElement(
    element,
    undefined,
    ...annotateChildren(element.props.children, entries, seen, render),
  );

/**
 * Wraps the first occurrence of each glossary abbreviation per section (the text between
 * two h2 headings) with `render`, leaving every other node untouched. Pure: it walks the
 * element tree that a compiled MDX page returns and never touches the DOM.
 */
export const annotateAbbreviations = (
  node: ReactNode,
  entries: readonly GlossaryEntry[],
  render: RenderAbbreviation,
): ReactNode => annotateChildren(node, entries, new Set(), render);
