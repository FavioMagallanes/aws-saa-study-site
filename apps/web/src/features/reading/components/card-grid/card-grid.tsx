import type { ReactNode } from 'react';
import styles from './card-grid.module.css';

interface CardGridProps {
  readonly children: ReactNode;
}

export const CardGrid = ({ children }: CardGridProps) => (
  <div className={styles['card-grid']}>{children}</div>
);
