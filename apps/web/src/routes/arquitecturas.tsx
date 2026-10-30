import { createFileRoute } from '@tanstack/react-router';
import { ArchitecturesIndexScreen } from '../features/architectures-index/components/architectures-index-screen';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';

const pages = loadPages();

const ArchitecturesRoute = () => {
  const { readPageIds, status } = useReadingProgress();
  return (
    <ArchitecturesIndexScreen
      pages={pages}
      guide={examGuide}
      readPageIds={readPageIds}
      progressStatus={status}
    />
  );
};

export const Route = createFileRoute('/arquitecturas')({ component: ArchitecturesRoute });
