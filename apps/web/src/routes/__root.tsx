import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { SiteFooter } from '../app/layout/site-footer/site-footer';
import { TopBar } from '../app/layout/top-bar/top-bar';

export const Route = createRootRoute({
  notFoundComponent: () => (
    <main>
      <h1>Página no encontrada</h1>
      <p>No existe una página con esa dirección.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  ),
  component: () => (
    <>
      <TopBar />
      <Outlet />
      <SiteFooter />
    </>
  ),
});
