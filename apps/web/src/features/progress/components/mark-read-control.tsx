import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../shared/ui/button/button';
import { ProgressRequestError } from '../api/progress-client';
import { useReadingProgress } from '../hooks/use-reading-progress';
import { useSetPageRead } from '../hooks/use-set-page-read';
import { useWriteKeyStore } from '../store/use-write-key-store';
import styles from './mark-read-control.module.css';
import { WriteKeyDialog } from './write-key-dialog';

interface MarkReadControlProps {
  readonly pageId: string;
}

const errorMessageFor = (error: Error | null): string | undefined => {
  if (!error) return undefined;
  const kind = error instanceof ProgressRequestError ? error.kind : 'failed';
  switch (kind) {
    case 'invalid-key':
      return 'La clave no es válida. Introdúcela de nuevo.';
    case 'unavailable':
      return 'No se pudo guardar: no hay conexión con el servicio. Inténtalo de nuevo.';
    default:
      return 'No se pudo guardar tu progreso. Inténtalo de nuevo.';
  }
};

export const MarkReadControl = ({ pageId }: MarkReadControlProps) => {
  const { readPageIds, status } = useReadingProgress();
  const setPageRead = useSetPageRead();
  const writeKey = useWriteKeyStore((state) => state.writeKey);
  const setWriteKey = useWriteKeyStore((state) => state.setWriteKey);
  const clearWriteKey = useWriteKeyStore((state) => state.clearWriteKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const refocusAfterSaveRef = useRef(false);

  const isRead = readPageIds.has(pageId);
  const isSaving = setPageRead.isPending;

  // Submitting the key closes the dialog while the button is disabled for the save, so the
  // dialog cannot hand focus back; return it here once the button is usable again.
  useEffect(() => {
    if (isSaving || !refocusAfterSaveRef.current) return;
    refocusAfterSaveRef.current = false;
    containerRef.current?.querySelector('button')?.focus();
  }, [isSaving]);

  const save = (read: boolean) => {
    setPageRead.mutate(
      { pageId, read },
      {
        onError: (error) => {
          if (error instanceof ProgressRequestError && error.kind === 'invalid-key') {
            clearWriteKey();
          }
        },
      },
    );
  };

  const handleClick = () => {
    if (!writeKey) {
      setDialogOpen(true);
      return;
    }
    save(!isRead);
  };

  return (
    <div ref={containerRef} className={styles['mark-read']}>
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
      <WriteKeyDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        onSubmit={(key) => {
          setWriteKey(key);
          setDialogOpen(false);
          refocusAfterSaveRef.current = true;
          save(!isRead);
        }}
      />
    </div>
  );
};
