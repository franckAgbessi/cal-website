import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

// The member dataset must remain private: it holds member profiles and drafts.
export default defineConfig({
  name: 'cal-members',
  title: 'Gazette CAL — membres',
  projectId: 'gacrkjml',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
