import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import emailjs from '@emailjs/browser';
import App from './App';
import { client } from './SanityConnect';
import { defaults, mergeContent, safeHref } from './content/siteContent';

jest.mock('./SanityConnect', () => ({ client: { fetch: jest.fn() } }));
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
}));
beforeEach(() => {
  global.ResizeObserver = class { observe() {} disconnect() {} };
});
afterEach(() => jest.restoreAllMocks());

test('keeps all sections available if Sanity cannot be reached', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  client.fetch.mockRejectedValue(new Error('offline'));
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Un héritage vivant.');
  expect(screen.getByRole('heading', { name: 'Des convictions qui nous lient.' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Préparer ma demande' })).toBeDisabled();
  await waitFor(() => expect(console.warn).toHaveBeenCalled());
});

test('loads published CMS content, circles and contact configuration', async () => {
  client.fetch.mockResolvedValue({ accueil: { titre: 'Titre publié' }, territoires: { cercles: [{ _key: 'test', nom: 'Cercle test' }] }, formulaire: { emailDestinataire: 'contact@example.org' } });
  render(<App />);
  await screen.findByRole('heading', { level: 1, name: /Titre publié/ });
  expect(screen.getByRole('option', { name: 'Cercle test' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Préparer ma demande' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
  expect(screen.getByRole('button', { name: 'Fermer' })).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(screen.getByRole('navigation'), { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
});

test('partial documents retain defaults while empty lists and unsafe links are handled', () => {
  const content = mergeContent(defaults, { accueil: { titre: null }, journal: { articles: [] } });
  expect(content.accueil.titre).toBe(defaults.accueil.titre);
  expect(content.journal.articles).toEqual([]);
  expect(safeHref('javascript:alert(1)')).toBeUndefined();
  expect(safeHref('//example.org')).toBeUndefined();
  expect(safeHref('#contact')).toBe('#contact');
});

test('map markers and form selection stay synchronized in both directions', async () => {
  client.fetch.mockResolvedValue({ territoires: { cercles: [
    { _key: 'toulouse', nom: 'CAL Toulouse', ville: 'Toulouse', latitude: 43.6047, longitude: 1.4442, logo: { url: 'https://example.org/toulouse.png' } },
    { _key: 'lille', nom: 'CAL Lille', ville: 'Lille', latitude: 50.6292, longitude: 3.0573 },
    { _key: 'legacy', nom: 'Ancien cercle' },
  ] } });
  render(<App />);
  const toulouse = await screen.findByRole('button', { name: 'Choisir CAL Toulouse — Toulouse' });
  fireEvent.click(toulouse);
  expect(screen.getByLabelText('Choisir un CAL')).toHaveValue('toulouse');
  expect(toulouse).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('status')).toHaveTextContent('CAL Toulouse');
  fireEvent.change(screen.getByLabelText('Choisir un CAL'), { target: { value: 'lille' } });
  expect(screen.getByRole('button', { name: 'Choisir CAL Lille — Lille' })).toHaveAttribute('aria-pressed', 'true');
  expect(toulouse).toHaveAttribute('aria-pressed', 'false');
  expect(screen.queryByRole('button', { name: 'Choisir Ancien cercle' })).not.toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Ancien cercle' })).toBeInTheDocument();
});

test('submits contact form through EmailJS when configured', async () => {
  emailjs.send.mockResolvedValue({ status: 200, text: 'OK' });
  client.fetch.mockResolvedValue({
    formulaire: {
      emailjsServiceId: 'service_xe1h166',
      emailjsTemplateId: 'template_test123',
      emailjsPublicKey: 'pk_test456',
    },
    territoires: {
      cercles: [{ _key: 'paris', nom: 'CAL Paris', ville: 'Paris' }],
    },
  });

  render(<App />);
  const submitButton = screen.getByRole('button', { name: 'Préparer ma demande' });
  await waitFor(() => expect(submitButton).toBeEnabled());

  fireEvent.change(screen.getByLabelText('Votre nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByLabelText('Votre prénom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByLabelText('Votre e-mail'), { target: { value: 'jean.dupont@example.org' } });
  fireEvent.change(screen.getByLabelText('Votre téléphone'), { target: { value: '0601020304' } });
  fireEvent.change(screen.getByLabelText('Choisir un CAL'), { target: { value: 'paris' } });
  fireEvent.change(screen.getByLabelText('Votre message'), { target: { value: 'Je souhaite adhérer.' } });

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(emailjs.send).toHaveBeenCalledWith(
      'service_xe1h166',
      'template_test123',
      expect.objectContaining({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.org',
        tel: '0601020304',
        cal: 'CAL Paris — Paris',
        message: 'Je souhaite adhérer.',
      }),
      { publicKey: 'pk_test456' }
    );
  });

  expect(await screen.findByText(/transmise avec succès/i)).toBeInTheDocument();
});
