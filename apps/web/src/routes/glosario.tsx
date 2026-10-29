import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/glosario')({
  component: () => (
    <main>
      <h1>Glosario</h1>
    </main>
  ),
});
