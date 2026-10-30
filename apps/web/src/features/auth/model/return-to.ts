export const SIGN_IN_PATH = '/acceso';

const PLACEHOLDER_ORIGIN = 'https://return-to.invalid';

// Only same-origin paths survive: no absolute or protocol-relative URLs, no backslashes or
// whitespace that browsers rewrite, and never the sign-in page itself (it would loop).
export const safeReturnTo = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }
  if (/[\\\s]/.test(value)) return undefined;
  const url = new URL(value, PLACEHOLDER_ORIGIN);
  if (url.origin !== PLACEHOLDER_ORIGIN) return undefined;
  if (url.pathname === SIGN_IN_PATH || url.pathname.startsWith(`${SIGN_IN_PATH}/`)) {
    return undefined;
  }
  return `${url.pathname}${url.search}${url.hash}`;
};
