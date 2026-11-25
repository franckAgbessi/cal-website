import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID;
const dataset = process.env.REACT_APP_SANITY_DATASET || 'production';

export const client = projectId ? createClient({
  projectId,
  dataset,
  apiVersion: process.env.REACT_APP_SANITY_API_VERSION || '2025-02-19',
  useCdn: true,
  perspective: 'published',
}) : null;

const builder = client ? imageUrlBuilder(client) : null;
export const imageUrl = (source, width = 1600) => source && builder ? builder.image(source).width(width).auto('format').fit('max').url() : undefined;
