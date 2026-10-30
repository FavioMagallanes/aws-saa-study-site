import { Link, useRouterState } from '@tanstack/react-router';
import { Button } from '../../../shared/ui/button/button';
import { useAuthSession } from '../../auth/hooks/use-auth-session';
import { SIGN_IN_PATH } from '../../auth/model/return-to';
import { useReadingProgress } from '../hooks/use-reading-progress';
import styles from './progress-notice.module.css';

export const ProgressNotice = () => {
  const auth = useAuthSession();
  const { status, retry } = useReadingProgress();
  const currentHref = useRouterState({ select: (state) => state.location.href });

  if (auth.status === 'signed-out') {
    return (
      <p className={styles['progress-notice--quiet']}>
        <Link
          to={SIGN_IN_PATH}
          search={{ returnTo: currentHref }}
          className={styles['progress-notice__link']}
        >
          Inicia sesión para guardar tu progreso
        </Link>
      </p>
    );
  }
  if (status !== 'error') return null;

  return (
    <div className={styles['progress-notice']} role="alert">
      <span>No se pudo cargar tu progreso. Puedes seguir leyendo.</span>
      <Button variant="secondary" onClick={retry}>
        Reintentar
      </Button>
    </div>
  );
};
