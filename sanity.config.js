import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const singletonTypes = [
  ['homePage', 'Landing — Accueil'],
  ['siteSettings', 'Paramètres du site'],
  ['aboutPage', 'Landing — Section « Le Cercle »'],
  ['historyPage', 'Landing — Section « Histoire »'],
  ['contactPage', 'Landing — Section « Contact »'],
];

const singletonItems = (S) => singletonTypes.map(([type, title]) => S.listItem()
  .title(title)
  .child(S.document().schemaType(type).documentId(type)));

// The member dataset must remain private: it holds member profiles and drafts.
export default defineConfig({
  name: 'cal-members',
  title: 'Gazette CAL — membres',
  projectId: 'gacrkjml',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({
    structure: (S) => S.list()
      .title('Contenus')
      .items([
        ...singletonItems(S),
        S.divider(),
        S.documentTypeListItem('article').title('Articles'),
        S.documentTypeListItem('category').title('Catégories'),
        S.documentTypeListItem('author').title('Auteurs'),
      ]),
  })],
  schema: { types: schemaTypes },
});
