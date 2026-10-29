import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/arquitecturas')({
  component: () => (
    <main>
      <h1>Arquitecturas</h1>
    </main>
  ),
});
