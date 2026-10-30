/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType, ElementType } from 'react';
  const MdxContent: ComponentType<{ components?: Record<string, ElementType> }>;
  export const meta: unknown;
  export default MdxContent;
}

interface ImportMetaEnv {
  // Neon Auth base URL (Neon Console > Auth > Configuration), e.g. https://<host>/neondb/auth.
  readonly VITE_NEON_AUTH_URL?: string;
}
