import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lectura/$pageId')({
  component: () => (
    <main>
      <h1>Página de lectura</h1>
    </main>
  ),
});
