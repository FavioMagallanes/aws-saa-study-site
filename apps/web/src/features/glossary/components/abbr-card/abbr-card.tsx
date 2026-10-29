import type { ReactNode } from 'react';
import { cx } from '../../../../shared/lib/class-names';
import styles from './abbr-card.module.css';

interface AbbrDetailsProps {
  readonly abbreviation?: string;
  readonly fullName: string;
  readonly definition: string;
  readonly footer?: ReactNode;
  readonly size?: 'card' | 'sheet';
}

export const AbbrDetails = ({
  abbreviation,
  fullName,
  definition,
  footer,
  size = 'card',
}: AbbrDetailsProps) => (
  <div className={cx(styles['abbr-details'], size === 'sheet' && styles['abbr-details--sheet'])}>
    {abbreviation ? (
      <span className={styles['abbr-details__abbreviation']}>{abbreviation}</span>
    ) : null}
    <p className={styles['abbr-details__name']}>{fullName}</p>
    <p className={styles['abbr-details__definition']}>{definition}</p>
    {footer}
  </div>
);

export const AbbrCard = (props: Omit<AbbrDetailsProps, 'size'>) => (
  <div className={styles['abbr-card']}>
    <AbbrDetails {...props} />
  </div>
);
