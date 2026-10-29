import { createFileRoute, notFound } from '@tanstack/react-router';
import { useMemo } from 'react';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { ReadingScreen } from '../features/reading/components/reading-screen';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';
import { loadPageContent } from '../features/reading/model/page-content';
import { buildReadingContext } from '../features/reading/model/reading-context';

const pages = loadPages();
const ReadingRoute = () => {
  const { page, Content } = Route.useLoaderData();
  const { readPageIds } = useReadingProgress();
  const context = useMemo(
    () => buildReadingContext(page, pages, examGuide, readPageIds),
    [page, readPageIds],
  );
  return <ReadingScreen page={page} Content={Content} context={context} />;
};

export const Route = createFileRoute('/lectura/$pageId')({
  loader: async ({ params }) => {
    const page = pages.find((candidate) => candidate.id === params.pageId);
    const Content = page ? await loadPageContent(page.id) : undefined;
    if (!page || !Content) throw notFound();
    return { page, Content };
  },
  component: ReadingRoute,
});
