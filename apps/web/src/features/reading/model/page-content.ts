import type { ComponentType, ElementType } from 'react';

export type PageContent = ComponentType<{ components?: Record<string, ElementType> }>;

interface PageModule {
  readonly default: PageContent;
}

const loaders = import.meta.glob<PageModule>('../../../../content/pages/**/*.mdx');

export const loadPageContent = async (pageId: string): Promise<PageContent | undefined> => {
  const entry = Object.entries(loaders).find(([path]) => path.endsWith(`/${pageId}.mdx`));
  return entry ? (await entry[1]()).default : undefined;
};
