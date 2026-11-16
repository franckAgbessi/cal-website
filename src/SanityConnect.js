import { createClient } from '@sanity/client';

export const projectId = process.env.REACT_APP_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'gacrkjml';
export const dataset = process.env.REACT_APP_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
export const token = process.env.REACT_APP_SANITY_TOKEN
  || process.env.REACT_APP_SANITY_WRITE_TOKEN
  || process.env.SANITY_WRITE_TOKEN
  || '';

// Client public pour le site web (avec CDN)
export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  useCdn: true,
  perspective: 'published',
});

// Client direct pour les membres et publications (sans CDN, avec token si disponible)
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  useCdn: false,
  token: token || undefined,
});
