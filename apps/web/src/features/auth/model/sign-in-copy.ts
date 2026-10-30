export const SIGN_IN_BENEFITS = [
  {
    title: 'Tu progreso viaja contigo',
    text: 'La ruta guiada continúa donde la dejaste.',
  },
  {
    title: 'Solo guardamos lo que lees',
    text: 'Páginas marcadas como leídas, nada más.',
  },
  {
    title: 'Sin contraseñas nuevas',
    text: 'Entra con tu cuenta de Google o GitHub.',
  },
] as const;

export const SIGN_IN_PROVIDERS = [
  { provider: 'google', label: 'Continuar con Google' },
  { provider: 'github', label: 'Continuar con GitHub' },
] as const;
