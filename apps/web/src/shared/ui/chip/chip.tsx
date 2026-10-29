import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../lib/class-names';
import { VisuallyHidden } from '../visually-hidden/visually-hidden';
import styles from './chip.module.css';

interface ChipProps {
  readonly read?: boolean;
  readonly children: ReactNode;
}

export const Chip = ({ read = false, children }: ChipProps) => (
  <span className={cx(styles.chip, read && styles['chip--read'])}>
    {read ? (
      <span className={styles.chip__icon} aria-hidden="true">
        <Check size={14} strokeWidth={1.75} />
      </span>
    ) : null}
    {children}
    {read ? <VisuallyHidden>(leído)</VisuallyHidden> : null}
  </span>
);
