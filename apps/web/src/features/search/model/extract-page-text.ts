// Pure and dependency-free: the build script runs it directly with Node type stripping.

export interface PageText {
  readonly headings: readonly string[];
  readonly summary: string;
}

const PENDING_BODY = 'Contenido pendiente.';
const STRUCTURAL_HEADINGS = new Set(['Fuentes oficiales']);
const HEADING_PATTERN = /^#{2,3}\s+(.+?)\s*$/;
// Blocks that are not prose: headings, lists, quotes, JSX and ESM (the `meta` export).
const NON_PARAGRAPH_PATTERN = /^(#|[-*+]\s|\d+\.\s|>|<|\{|import\s|export\s)/;

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const extractPageText = (source: string): PageText | undefined => {
  if (source.includes(PENDING_BODY)) return undefined;

  const headings = source
    .split('\n')
    .map((line) => HEADING_PATTERN.exec(line)?.[1])
    .filter((heading): heading is string => heading !== undefined)
    .map(stripInlineMarkdown)
    .filter((heading) => !STRUCTURAL_HEADINGS.has(heading));

  const firstParagraph = source
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !NON_PARAGRAPH_PATTERN.test(block));

  return { headings, summary: stripInlineMarkdown(firstParagraph ?? '') };
};
