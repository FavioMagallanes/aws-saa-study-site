import { lazy } from 'react';

// The dialog chunk carries MiniSearch and the search indexes, so it stays out of the main bundle.
const loadSearchDialog = () => import('./search-dialog/search-dialog');

// Each call imports again, so a failed preload does not poison the lazy component.
export const preloadSearchDialog = (): Promise<unknown> => loadSearchDialog();

export const LazySearchDialog = lazy(() =>
  loadSearchDialog().then((module) => ({ default: module.SearchDialog })),
);
