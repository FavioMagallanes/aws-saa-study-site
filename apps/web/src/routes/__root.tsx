import { Link, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { SiteFooter } from '../app/layout/site-footer/site-footer';
import { BrandTopBar, TopBar } from '../app/layout/top-bar/top-bar';
import { SIGN_IN_PATH } from '../features/auth/model/return-to';
import { ProgressNotice } from '../features/progress/components/progress-notice';

const RootLayout = () => {
  const onSignIn = useRouterState({
    select: (state) => state.location.pathname === SIGN_IN_PATH,
  });
  return (
    <>
      {onSignIn ? (
        <BrandTopBar />
      ) : (
        <>
          <TopBar />
          <ProgressNotice />
        </>
      )}
      <Outlet />
      <SiteFooter />
    </>
  );
};

export const Route = createRootRoute({
  notFoundComponent: () => (
    <main>
      <h1>Página no encontrada</h1>
      <p>No existe una página con esa dirección.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  ),
  component: RootLayout,
});
