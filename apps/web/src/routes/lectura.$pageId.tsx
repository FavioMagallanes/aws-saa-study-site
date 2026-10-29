import { createFileRoute, notFound } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { ReadingScreen } from '../features/reading/components/reading-screen';
import { loadPageContent } from '../features/reading/model/page-content';
import { buildReadingContext } from '../features/reading/model/reading-context';

const pages = loadPages();
// Reading progress is wired to the API in phase 3; until then nothing is marked as read.
const NO_PAGES_READ: ReadonlySet<string> = new Set();

const ReadingRoute = () => {
  const { page, Content, context } = Route.useLoaderData();
  return <ReadingScreen page={page} Content={Content} context={context} />;
};

export const Route = createFileRoute('/lectura/$pageId')({
  loader: async ({ params }) => {
    const page = pages.find((candidate) => candidate.id === params.pageId);
    const Content = page ? await loadPageContent(page.id) : undefined;
    if (!page || !Content) throw notFound();
    return { page, Content, context: buildReadingContext(page, pages, examGuide, NO_PAGES_READ) };
  },
  component: ReadingRoute,
});
