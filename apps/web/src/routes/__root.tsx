import { Link, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { BrandOnlyLayout } from '../app/layout/brand-only-layout/brand-only-layout';
import { SiteFooter } from '../app/layout/site-footer/site-footer';
import { TopBar } from '../app/layout/top-bar/top-bar';
import { SIGN_IN_PATH } from '../features/auth/model/return-to';
import { ProgressNotice } from '../features/progress/components/progress-notice';
import motion from '../shared/styles/motion.module.css';

// The reading screen fades in only its own content, so its sidebar and fixed action bar stay put.
const READING_ROUTE_ID = '/lectura/$pageId';

const RootLayout = () => {
  const onSignIn = useRouterState({
    select: (state) => state.location.pathname === SIGN_IN_PATH,
  });
  const screenRouteId = useRouterState({ select: (state) => state.matches.at(-1)?.routeId });
  // The sign-in screen shows only the brand: no navigation, progress notice or site footer.
  if (onSignIn) {
    return (
      <BrandOnlyLayout>
        <Outlet />
      </BrandOnlyLayout>
    );
  }
  return (
    <>
      <TopBar />
      <ProgressNotice />
      {/* Keyed by screen so the content fades in on every screen change; the bars stay still. */}
      <div
        key={screenRouteId}
        className={screenRouteId === READING_ROUTE_ID ? undefined : motion['page-enter']}
      >
        <Outlet />
      </div>
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
