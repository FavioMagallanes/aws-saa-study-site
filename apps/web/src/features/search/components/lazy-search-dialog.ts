import { lazy } from 'react';

// The dialog chunk carries MiniSearch and the page index, so it loads on first open only.
export const LazySearchDialog = lazy(() =>
  import('./search-dialog/search-dialog').then((module) => ({ default: module.SearchDialog })),
);
