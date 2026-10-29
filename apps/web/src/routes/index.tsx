import { createFileRoute } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { HomeScreen } from '../features/home/components/home-screen';

const pages = loadPages();
// Reading progress is wired to the API in phase 3; until then nothing is marked as read.
const NO_PAGES_READ: ReadonlySet<string> = new Set();

export const Route = createFileRoute('/')({
  component: () => <HomeScreen pages={pages} guide={examGuide} readPageIds={NO_PAGES_READ} />,
});
