import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fakeAuth } from '../../../../app/tests/fake-auth-client';
import { getTopBar, renderApp } from '../../../../app/tests/render-app';

const BENEFITS = [
  ['Tu progreso viaja contigo', 'La ruta guiada continúa donde la dejaste.'],
  ['Solo guardamos lo que lees', 'Páginas marcadas como leídas, nada más.'],
  ['Sin contraseñas nuevas', 'Entra con tu cuenta de Google o GitHub.'],
] as const;

const renderAccess = (search = '') => {
  fakeAuth.session = null;
  return renderApp(`/acceso${search}`);
};

const signInCard = () => screen.getByRole('region', { name: 'Inicia sesión' });

describe('Acceso screen', () => {
  it('shows the approved copy, the two providers and the way back to reading', async () => {
    await renderAccess();
    expect(screen.getByText('GUARDA TU PROGRESO')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Sigue tu ruta de estudio desde cualquier lugar',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Inicia sesión para marcar lo que ya leíste y retomarlo en tu teléfono, tu tableta o tu computadora. Leer sigue siendo libre: no necesitas cuenta para estudiar.',
      ),
    ).toBeInTheDocument();
    const benefits = screen.getByRole('list', { name: 'Ventajas de iniciar sesión' });
    const items = within(benefits).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(
      BENEFITS.map(([title, text]) => `${title}${text}`),
    );

    const card = signInCard();
    expect(within(card).getByRole('heading', { level: 2, name: 'Inicia sesión' })).toBeVisible();
    expect(within(card).getByText('Elige cómo quieres entrar.')).toBeInTheDocument();
    expect(
      within(card)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Continuar con Google', 'Continuar con GitHub']);
    expect(within(card).queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(card).getByText(/¿Solo quieres leer\?/)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Sigue sin cuenta' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('shows only the brand in the top bar and no progress notice', async () => {
    await renderAccess();
    const header = getTopBar();
    expect(within(header).getAllByRole('link')).toHaveLength(1);
    expect(
      within(header).getByRole('link', { name: 'Arquitecto · SAA-C03, inicio' }),
    ).toBeInTheDocument();
    expect(within(header).queryByRole('button')).not.toBeInTheDocument();
    expect(within(header).queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByText('Inicia sesión para guardar tu progreso')).not.toBeInTheDocument();
  });

  it.each([
    ['Continuar con Google', 'google'],
    ['Continuar con GitHub', 'github'],
  ] as const)(
    '%s starts the %s sign-in and comes back to the page the visitor came from',
    async (label, provider) => {
      await renderAccess(`?returnTo=${encodeURIComponent('/lectura/amazon-sqs')}`);
      fireEvent.click(within(signInCard()).getByRole('button', { name: label }));
      await waitFor(() => {
        expect(fakeAuth.signInCalls).toEqual([
          { provider, callbackURL: `${window.location.origin}/lectura/amazon-sqs` },
        ]);
      });
      for (const button of within(signInCard()).getAllByRole('button')) {
        expect(button).toBeDisabled();
      }
    },
  );

  it.each([
    ['an absolute URL', 'https://evil.example/lectura/amazon-sqs'],
    ['a protocol-relative path', '//evil.example/lectura'],
    ['no returnTo', undefined],
  ])('comes back to the home page when returnTo is %s', async (_label, returnTo) => {
    await renderAccess(returnTo === undefined ? '' : `?returnTo=${encodeURIComponent(returnTo)}`);
    fireEvent.click(within(signInCard()).getByRole('button', { name: 'Continuar con Google' }));
    await waitFor(() => {
      expect(fakeAuth.signInCalls).toEqual([
        { provider: 'google', callbackURL: `${window.location.origin}/` },
      ]);
    });
  });

  it('explains a failed sign-in and lets the visitor try again', async () => {
    fakeAuth.signInFails = true;
    await renderAccess();
    const google = within(signInCard()).getByRole('button', { name: 'Continuar con Google' });
    fireEvent.click(google);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión. Inténtalo de nuevo.',
    );
    expect(google).toBeEnabled();
  });
});
