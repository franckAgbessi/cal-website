import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import { client } from './SanityConnect';
import { defaults, mergeContent, safeHref } from './content/siteContent';

jest.mock('./SanityConnect', () => ({ client: { fetch: jest.fn() } }));
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
