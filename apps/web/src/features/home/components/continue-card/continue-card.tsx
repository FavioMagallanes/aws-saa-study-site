import { ArrowRight } from 'lucide-react';
import type { PageMeta } from '@arquitecto/contracts/content';
import { ButtonLink } from '../../../../shared/ui/button/button-link';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import type { ProgressSummary } from '../../model/home-overview';
import styles from './continue-card.module.css';

interface ContinueCardProps {
  readonly summary: ProgressSummary;
  readonly nextPage: PageMeta | undefined;
  readonly lastReadTitle?: string;
}

export const ContinueCard = ({ summary, nextPage, lastReadTitle }: ContinueCardProps) => (
  <div className={styles['continue-card']}>
    <div className={styles['continue-card__progress']}>
      <p className={styles['continue-card__count']}>
        Llevas {summary.read} de {summary.total} páginas
      </p>
      <ProgressBar label="Progreso de lectura" percentage={summary.percentage} />
      {lastReadTitle ? (
        <p className={styles['continue-card__last']}>Último tema: {lastReadTitle}</p>
      ) : null}
    </div>
    {nextPage ? (
      <ButtonLink
        to="/lectura/$pageId"
        params={{ pageId: nextPage.id }}
        trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
      >
        {summary.read === 0 ? 'Empezar a leer' : 'Continuar leyendo'}
      </ButtonLink>
    ) : null}
  </div>
);
