import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/servicios')({
  component: () => (
    <main>
      <h1>Servicios</h1>
    </main>
  ),
});
