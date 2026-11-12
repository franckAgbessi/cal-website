import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'gacrkjml',
    dataset: process.env.SANITY_STUDIO_DATASET || 'members',
  },
});
