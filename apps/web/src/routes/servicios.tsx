import { createFileRoute } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';
import { ServicesIndexScreen } from '../features/services-index/components/services-index-screen';

const pages = loadPages();

const ServicesRoute = () => {
  const { readPageIds, status } = useReadingProgress();
  return (
    <ServicesIndexScreen
      pages={pages}
      guide={examGuide}
      readPageIds={readPageIds}
      progressStatus={status}
    />
  );
};

export const Route = createFileRoute('/servicios')({ component: ServicesRoute });
