import { cx } from '../../../../shared/lib/class-names';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import type { DomainMap } from '../../model/exam-map';
import { DOMAIN_SHORT_TITLES } from '../../../content/model/domain-labels';
import styles from './domain-card.module.css';

interface DomainCardProps {
  readonly domain: DomainMap;
  readonly active: boolean;
  readonly onSelect: () => void;
}

export const DomainCard = ({ domain, active, onSelect }: DomainCardProps) => (
  <button
    type="button"
    className={cx(styles['domain-card'], active && styles['domain-card--active'])}
    aria-pressed={active}
    onClick={onSelect}
  >
    <span className={styles['domain-card__top']}>
      <span className={styles['domain-card__label']}>Dominio {domain.id}</span>
      <span className={styles['domain-card__weight']}>{domain.weight} %</span>
    </span>
    <span className={styles['domain-card__name']}>
      {DOMAIN_SHORT_TITLES[domain.id] ?? domain.title}
    </span>
    <ProgressBar
      label={`Progreso del dominio ${String(domain.id)}`}
      percentage={domain.summary.percentage}
    />
    <span className={styles['domain-card__read']}>{domain.summary.percentage} % leído</span>
  </button>
);
