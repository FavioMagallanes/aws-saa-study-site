import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/buscar')({
  component: () => (
    <main>
      <h1>Búsqueda</h1>
    </main>
  ),
});
