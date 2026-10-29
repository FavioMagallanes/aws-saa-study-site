import type { ReactNode } from 'react';

export const slugifyHeading = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const headingIdFrom = (children: ReactNode): string | undefined =>
  typeof children === 'string' ? slugifyHeading(children) : undefined;
