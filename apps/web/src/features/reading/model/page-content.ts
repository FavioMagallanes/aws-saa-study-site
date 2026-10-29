import type { ElementType, ReactNode } from 'react';

// MDX compiles each page to a pure function component without hooks, so the reading body can
// expand it into its element tree before rendering (see annotate-abbreviations).
export type PageContent = (props: { components?: Record<string, ElementType> }) => ReactNode;

interface PageModule {
  readonly default: PageContent;
}

const loaders = import.meta.glob<PageModule>('../../../../content/pages/**/*.mdx');

export const loadPageContent = async (pageId: string): Promise<PageContent | undefined> => {
  const entry = Object.entries(loaders).find(([path]) => path.endsWith(`/${pageId}.mdx`));
  return entry ? (await entry[1]()).default : undefined;
};
