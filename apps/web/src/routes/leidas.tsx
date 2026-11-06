import { createFileRoute } from '@tanstack/react-router';
import { loadPages } from '../features/content/data/load-pages';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';
import { ReadPagesScreen } from '../features/read-pages/components/read-pages-screen';

const pages = loadPages();

const ReadPagesRoute = () => {
  const { readPageIds, status, signedIn } = useReadingProgress();
  return (
    <ReadPagesScreen
      pages={pages}
      readPageIds={readPageIds}
      progressStatus={status}
      signedIn={signedIn}
    />
  );
};

export const Route = createFileRoute('/leidas')({ component: ReadPagesRoute });
