import { createFileRoute } from '@tanstack/react-router';
import { loadPages } from '../features/content/data/load-pages';
import { glossary } from '../features/glossary/data/load-glossary';
import { GlossaryScreen } from '../features/glossary/components/glossary-screen';

const pageTitles: ReadonlyMap<string, string> = new Map(
  loadPages().map((page) => [page.id, page.title]),
);

export const Route = createFileRoute('/glosario')({
  component: () => <GlossaryScreen entries={glossary} pageTitles={pageTitles} />,
});
