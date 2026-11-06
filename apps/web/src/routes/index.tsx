import { createFileRoute } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { buildReadingPath } from '../features/content/model/reading-path';
import { HomeScreen } from '../features/home/components/home-screen';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';

const pages = loadPages();
const readingPath = buildReadingPath(pages, examGuide);

const HomeRoute = () => {
  const { readPageIds, lastReadPageId, status } = useReadingProgress();
  const lastReadTitle = pages.find((page) => page.id === lastReadPageId)?.title;
  return (
    <HomeScreen
      pages={pages}
      guide={examGuide}
      readingPath={readingPath}
      readPageIds={readPageIds}
      progressStatus={status}
      {...(lastReadTitle === undefined ? {} : { lastReadTitle })}
    />
  );
};

export const Route = createFileRoute('/')({ component: HomeRoute });
