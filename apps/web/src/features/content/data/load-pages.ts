import { pageMetaSchema, type PageMeta } from '@arquitecto/contracts/content';
// Generated from the MDX `meta` exports (scripts/generate-page-meta-index.ts). Importing the MDX
// modules here would put every page body in the main bundle and defeat the lazy page loader.
import pageMetaIndex from './page-meta-index.json';

export const loadPages = (): PageMeta[] =>
  Object.entries(pageMetaIndex).map(([path, meta]) => {
    const parsed = pageMetaSchema.safeParse(meta);
    if (!parsed.success) {
      throw new Error(`Invalid page meta in ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
