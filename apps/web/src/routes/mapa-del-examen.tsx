import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mapa-del-examen')({
  component: () => (
    <main>
      <h1>Mapa del examen</h1>
    </main>
  ),
});
