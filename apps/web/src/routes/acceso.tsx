import { createFileRoute } from '@tanstack/react-router';
import { SignInScreen } from '../features/auth/components/sign-in-screen/sign-in-screen';
import { safeReturnTo } from '../features/auth/model/return-to';

interface AccessSearch {
  // Explicitly undefined when rejected: the router would otherwise keep the raw value.
  readonly returnTo?: string | undefined;
}

const AccessRoute = () => {
  const { returnTo } = Route.useSearch();
  return <SignInScreen returnTo={returnTo ?? '/'} />;
};

export const Route = createFileRoute('/acceso')({
  // Anything but a same-origin path is dropped, so the sign-in can only come back to this site.
  validateSearch: (search: Record<string, unknown>): AccessSearch => ({
    returnTo: safeReturnTo(search.returnTo),
  }),
  component: AccessRoute,
});
