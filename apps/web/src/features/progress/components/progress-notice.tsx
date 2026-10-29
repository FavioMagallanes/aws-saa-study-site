import { Button } from '../../../shared/ui/button/button';
import { useReadingProgress } from '../hooks/use-reading-progress';
import styles from './progress-notice.module.css';

export const ProgressNotice = () => {
  const { status, retry } = useReadingProgress();
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
