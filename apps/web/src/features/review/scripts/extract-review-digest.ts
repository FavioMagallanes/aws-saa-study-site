/// <reference types="node" />
// Build-time only: derives a study digest from the page's own MDX, so the review screen restates
// the real content instead of a second, hand-written copy that could drift from it.
import { runInNewContext } from 'node:vm';

export interface ReviewConcept {
  readonly term: string;
  readonly summary: string;
}

export interface ReviewDigest {
  readonly intro: string;
  readonly problem: string;
  readonly concepts: readonly ReviewConcept[];
  readonly whenToUse: readonly string[];
}

const PENDING_BODY = 'Contenido pendiente.';
const NON_PARAGRAPH_PATTERN = /^(#|[-*+]\s|\d+\.\s|>|<|\{|import\s|export\s)/;
const BULLET_PATTERN = /^-\s+\*\*(.+?)\*\*\s*(?:[:：]|[—–-])?\s*(.*)$/;
const USE_ITEMS_PATTERN = /variant="use"[\s\S]*?items=\{(\[[\s\S]*?\])\}/;

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const firstSentence = (text: string): string => /^.+?[.!?](?=\s|$)/.exec(text)?.[0] ?? text;

const sectionBody = (source: string, heading: string): string => {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
};

const paragraphsOf = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !NON_PARAGRAPH_PATTERN.test(block));

const bulletConcepts = (section: string): ReviewConcept[] =>
  section.split('\n').flatMap((line) => {
    const match = BULLET_PATTERN.exec(line.trim());
    if (!match) return [];
    const [, term = '', text = ''] = match;
    return [{ term: stripInlineMarkdown(term), summary: firstSentence(stripInlineMarkdown(text)) }];
  });

const headingConcepts = (section: string): ReviewConcept[] =>
  section
    .split(/^### +/m)
    .slice(1)
    .map((block) => {
      const [title = '', ...body] = block.split('\n');
      const text = body.join('\n');
      const firstBullet = /^-\s+(.+)$/m.exec(text)?.[1] ?? '';
      const summary = paragraphsOf(text)[0] ?? firstBullet;
      return {
        term: stripInlineMarkdown(title),
        summary: firstSentence(stripInlineMarkdown(summary)),
      };
    });

const itemsOfUseBox = (source: string): string[] => {
  const literal = USE_ITEMS_PATTERN.exec(source)?.[1];
  if (literal === undefined) return [];
  // The literal comes from our own content files; an empty context evaluates it like MDX would.
  const items: unknown = runInNewContext(literal, {}, { timeout: 1000 });
  return Array.isArray(items)
    ? items.filter((item): item is string => typeof item === 'string').map(stripInlineMarkdown)
    : [];
};

export const extractReviewDigest = (source: string): ReviewDigest | undefined => {
  if (source.includes(PENDING_BODY)) return undefined;

  const keyConcepts = sectionBody(source, 'Conceptos clave');
  const bullets = bulletConcepts(keyConcepts);

  return {
    intro: stripInlineMarkdown(paragraphsOf(source)[0] ?? ''),
    problem: firstSentence(
      stripInlineMarkdown(paragraphsOf(sectionBody(source, 'Qué problema resuelve'))[0] ?? ''),
    ),
    concepts: bullets.length > 0 ? bullets : headingConcepts(keyConcepts),
    whenToUse: itemsOfUseBox(source),
  };
};
