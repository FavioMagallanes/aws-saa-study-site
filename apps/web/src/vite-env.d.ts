/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const MdxContent: ComponentType;
  export const meta: unknown;
  export default MdxContent;
}
