import { Outlet, createRootRoute } from '@tanstack/react-router';
import { SiteFooter } from '../app/layout/site-footer/site-footer';
import { TopBar } from '../app/layout/top-bar/top-bar';

export const Route = createRootRoute({
  component: () => (
    <>
      <TopBar />
      <Outlet />
      <SiteFooter />
    </>
  ),
});
