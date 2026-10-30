import { ArrowRight } from 'lucide-react';
import type { PageMeta } from '@arquitecto/contracts/content';
import { ButtonLink } from '../../../../shared/ui/button/button-link';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import type { ProgressStatus } from '../../../progress/hooks/use-reading-progress';
import type { ProgressSummary } from '../../../content/model/page-progress';
import { START_READING_HINT } from '../../model/home-copy';
import styles from './continue-card.module.css';

interface ContinueCardProps {
  readonly summary: ProgressSummary;
  readonly nextPage: PageMeta | undefined;
  readonly lastReadTitle?: string;
  readonly progressStatus: ProgressStatus;
}

export const ContinueCard = ({
  summary,
  nextPage,
  lastReadTitle,
  progressStatus,
}: ContinueCardProps) => (
  <div className={styles['continue-card']}>
    <div className={styles['continue-card__progress']}>
      <p className={styles['continue-card__count']} aria-live="polite">
        {progressStatus === 'ready'
          ? `Llevas ${String(summary.read)} de ${String(summary.total)} páginas`
          : progressStatus === 'loading'
            ? 'Cargando tu progreso…'
            : 'Tu progreso no está disponible ahora'}
      </p>
      <ProgressBar label="Progreso de lectura" percentage={summary.percentage} />
      {progressStatus === 'ready' && summary.read === 0 ? (
        <p className={styles['continue-card__hint']}>{START_READING_HINT}</p>
      ) : progressStatus === 'ready' && lastReadTitle ? (
        <p className={styles['continue-card__last']}>Último tema: {lastReadTitle}</p>
      ) : null}
    </div>
    {nextPage ? (
      <ButtonLink
        to="/lectura/$pageId"
        params={{ pageId: nextPage.id }}
        trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
      >
        {progressStatus === 'ready' && summary.read > 0 ? 'Continuar leyendo' : 'Empezar a leer'}
      </ButtonLink>
    ) : null}
  </div>
);
