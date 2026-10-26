import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: 'gacrkjml',
    dataset: 'production',
    apiVersion: '2026-03-01',
    useCdn: true,
    perspective: 'published',
});