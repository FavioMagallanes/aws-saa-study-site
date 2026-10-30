import type { ReactNode } from 'react';
import { BrandTopBar } from '../top-bar/top-bar';
import styles from './brand-only-layout.module.css';

interface BrandOnlyLayoutProps {
  readonly children: ReactNode;
}

// The sign-in screens: only the brand on top, no site footer, and the screen fills the rest of
// the viewport (the viewport height minus the bar, whatever height the bar ends up with).
export const BrandOnlyLayout = ({ children }: BrandOnlyLayoutProps) => (
  <div className={styles['brand-only-layout']}>
    <BrandTopBar />
    <div className={styles['brand-only-layout__screen']}>{children}</div>
  </div>
);
