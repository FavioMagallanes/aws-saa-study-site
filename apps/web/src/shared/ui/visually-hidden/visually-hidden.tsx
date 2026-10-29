import type { ReactNode } from 'react';
import styles from './visually-hidden.module.css';

interface VisuallyHiddenProps {
  readonly children: ReactNode;
}

export const VisuallyHidden = ({ children }: VisuallyHiddenProps) => (
  <span className={styles['visually-hidden']}>{children}</span>
);
