import { createFileRoute } from '@tanstack/react-router';
import { examGuide } from '../features/content/data/load-exam-guide';
import { loadPages } from '../features/content/data/load-pages';
import { ExamMapScreen } from '../features/exam-map/components/exam-map-screen';
import { useReadingProgress } from '../features/progress/hooks/use-reading-progress';

const pages = loadPages();

const ExamMapRoute = () => {
  const { readPageIds } = useReadingProgress();
  return <ExamMapScreen pages={pages} guide={examGuide} readPageIds={readPageIds} />;
};

export const Route = createFileRoute('/mapa-del-examen')({ component: ExamMapRoute });
