const { createClient } = require('@sanity/client');

// This is deliberately the only public reader for the private member dataset.
// It projects approved content only; emails, member profiles and drafts never leave the server.
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée.' });
  const { SANITY_PROJECT_ID, SANITY_WRITE_TOKEN, SANITY_MEMBERS_DATASET } = process.env;
  if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN || !SANITY_MEMBERS_DATASET) return res.status(503).json({ message: 'Gazette non configurée.' });
  try {
    const client = createClient({ projectId: SANITY_PROJECT_ID, dataset: SANITY_MEMBERS_DATASET, apiVersion: '2026-03-01', token: SANITY_WRITE_TOKEN, useCdn: false });
    const articles = await client.fetch(`*[_type == "calArticle" && publicationStatus == "official"] | order(officialPublishedAt desc, _createdAt desc)[0...12] {
      _id, "_key": _id, category, title, excerpt, body, "description": coalesce(excerpt, body),
      "href": "/cal#article-" + _id, image { alt, "url": asset->url }, authorName, officialPublishedAt
    }`);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(articles);
  } catch (error) {
    console.error('official articles read failed', error);
    return res.status(500).json({ message: 'La gazette est indisponible.' });
  }
};
