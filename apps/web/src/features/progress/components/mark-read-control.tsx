import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { Button } from '../../../shared/ui/button/button';
import { SIGN_IN_PATH } from '../../auth/model/return-to';
import { ProgressRequestError } from '../api/progress-client';
import { useReadingProgress } from '../hooks/use-reading-progress';
import { useSetPageRead } from '../hooks/use-set-page-read';
import styles from './mark-read-control.module.css';

interface MarkReadControlProps {
  readonly pageId: string;
}

const errorMessageFor = (error: Error | null): string | undefined => {
  if (!error) return undefined;
  const kind = error instanceof ProgressRequestError ? error.kind : 'failed';
  switch (kind) {
    case 'unauthorized':
      return 'Tu sesión ya no es válida. Inicia sesión de nuevo.';
    case 'unavailable':
      return 'No se pudo guardar: no hay conexión con el servicio. Inténtalo de nuevo.';
    default:
      return 'No se pudo guardar tu progreso. Inténtalo de nuevo.';
  }
};

export const MarkReadControl = ({ pageId }: MarkReadControlProps) => {
  const { readPageIds, status, signedIn } = useReadingProgress();
  const setPageRead = useSetPageRead();
  const navigate = useNavigate();
  const currentHref = useRouterState({ select: (state) => state.location.href });

  const isRead = readPageIds.has(pageId);
  const isSaving = setPageRead.isPending;

  const handleClick = () => {
    if (!signedIn) {
      void navigate({ to: SIGN_IN_PATH, search: { returnTo: currentHref } });
      return;
    }
    setPageRead.mutate({ pageId, read: !isRead });
  };

  return (
    <div className={styles['mark-read']}>
      <Button
        variant={isRead ? 'read' : 'secondary'}
        leadingIcon={isRead ? <Check size={16} strokeWidth={1.75} /> : undefined}
        aria-pressed={isRead}
        disabled={status !== 'ready' || isSaving}
        onClick={handleClick}
      >
        {isRead ? 'Leído' : 'Marcar como leído'}
      </Button>
      <p className={styles['mark-read__error']} role="alert">
        {errorMessageFor(setPageRead.error)}
      </p>
    </div>
  );
};
