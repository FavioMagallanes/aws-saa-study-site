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

// Phrasing elements only: the card can open inside a paragraph of the reading body.
export const AbbrDetails = ({
  abbreviation,
  fullName,
  definition,
  footer,
  size = 'card',
}: AbbrDetailsProps) => (
  <span className={cx(styles['abbr-details'], size === 'sheet' && styles['abbr-details--sheet'])}>
    {abbreviation ? (
      <span className={styles['abbr-details__abbreviation']}>{abbreviation}</span>
    ) : null}
    <span className={styles['abbr-details__name']}>{fullName}</span>
    <span className={styles['abbr-details__definition']}>{definition}</span>
    {footer}
  </span>
);

export const AbbrCard = (props: Omit<AbbrDetailsProps, 'size'>) => (
  <span className={styles['abbr-card']}>
    <AbbrDetails {...props} />
  </span>
);
