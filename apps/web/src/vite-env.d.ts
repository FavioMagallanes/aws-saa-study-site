/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType, ElementType } from 'react';
  const MdxContent: ComponentType<{ components?: Record<string, ElementType> }>;
  export const meta: unknown;
  export default MdxContent;
}
