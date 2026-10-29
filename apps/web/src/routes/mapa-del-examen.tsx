import { createFileRoute } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { ExamMapScreen } from '../features/exam-map/components/exam-map-screen';

const pages = loadPages();
// Reading progress is wired to the API in phase 3; until then nothing is marked as read.
const NO_PAGES_READ: ReadonlySet<string> = new Set();

export const Route = createFileRoute('/mapa-del-examen')({
  component: () => <ExamMapScreen pages={pages} guide={examGuide} readPageIds={NO_PAGES_READ} />,
});
