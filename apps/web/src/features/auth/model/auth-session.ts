export type AuthProvider = 'google' | 'github';

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  // The Neon Auth JWT the progress API verifies (sent as `Authorization: Bearer`).
  readonly accessToken: string;
}

export type AuthState =
  | { readonly status: 'checking' }
  | { readonly status: 'signed-out' }
  | { readonly status: 'signed-in'; readonly user: AuthUser };

const firstLetter = (word: string): string => {
  const codePoint = word.codePointAt(0);
  return codePoint === undefined ? '' : String.fromCodePoint(codePoint).toLocaleUpperCase('es');
};

export const userInitials = ({ name, email }: Pick<AuthUser, 'name' | 'email'>): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const fromName = words
    .slice(0, 2)
    .map((word) => firstLetter(word))
    .join('');
  return fromName || firstLetter(email) || '?';
};
