import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./sanity/client', () => ({ client: null, imageUrl: () => undefined }));
jest.mock('@portabletext/react', () => ({ PortableText: () => null }));

test('affiche l’accueil éditorial lorsque Sanity n’est pas configuré', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('L’héritage de la France, l’âme de Toulouse.');
  expect(screen.getByRole('link', { name: 'Lire nos publications' })).toHaveAttribute('href', '/actualites');
});
