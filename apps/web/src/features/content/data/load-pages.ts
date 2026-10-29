import { pageMetaSchema, type PageMeta } from '@arquitecto/contracts/content';

const metaByPath = import.meta.glob<unknown>('../../../../content/pages/**/*.mdx', {
  eager: true,
  import: 'meta',
});

export const loadPages = (): PageMeta[] =>
  Object.entries(metaByPath).map(([path, meta]) => {
    const parsed = pageMetaSchema.safeParse(meta);
    if (!parsed.success) {
      throw new Error(`Invalid page meta in ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
