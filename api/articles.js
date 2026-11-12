const { createClient } = require('@sanity/client');

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const allowedCategories = new Set(['Vie locale', 'Initiative', 'Portrait', 'Débat']);

function config() {
  const required = ['SUPABASE_URL', 'SANITY_PROJECT_ID', 'SANITY_WRITE_TOKEN', 'SANITY_MEMBERS_DATASET', 'SANITY_ARTICLES_DATASET'];
  if (required.some(key => !process.env[key])) throw new Error('Configuration serveur incomplète.');
  if (!process.env.SUPABASE_PUBLISHABLE_KEY && !process.env.SUPABASE_ANON_KEY) throw new Error('Clé Supabase publique manquante.');
  return process.env;
}

function text(value, limit) { return typeof value === 'string' ? value.trim().slice(0, limit) : ''; }

async function getMember(req, env) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const auth = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!auth.ok) return null;
  const user = await auth.json();
  const members = createClient({ projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_MEMBERS_DATASET, apiVersion: '2026-03-01', token: env.SANITY_WRITE_TOKEN, useCdn: false });
  const member = await members.fetch('*[_type == "calMember" && authUserId == $id && active == true][0]{displayName, role}', { id: user.id });
  return member ? { user, member } : null;
}

function imageBuffer(image) {
  if (!image?.dataUrl || typeof image.dataUrl !== 'string') return null;
  const match = image.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Le format de l’image est invalide.');
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error('L’image dépasse la limite de 3 Mo.');
  return { buffer, contentType: match[1], filename: text(image.name, 100) || 'article-image' };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée.' });
  try {
    const env = config();
    const identity = await getMember(req, env);
    if (!identity) return res.status(401).json({ message: 'Votre session est invalide ou ce compte n’est pas autorisé.' });
    const title = text(req.body?.title, 120), body = text(req.body?.body, 8000), authorName = text(req.body?.authorName, 60);
    const category = text(req.body?.category, 40), intent = req.body?.publicationIntent === 'official-request' ? 'official-request' : 'members';
    if (!title || !body || !authorName || !allowedCategories.has(category)) return res.status(400).json({ message: 'Vérifiez le titre, le texte, la rubrique et votre signature.' });
    const articles = createClient({ projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_ARTICLES_DATASET, apiVersion: '2026-03-01', token: env.SANITY_WRITE_TOKEN, useCdn: false });
    const source = imageBuffer(req.body?.image);
    const asset = source && await articles.assets.upload('image', source.buffer, { filename: source.filename, contentType: source.contentType });
    const excerpt = body.length > 280 ? `${body.slice(0, 277).trimEnd()}…` : body;
    await articles.create({ _type: 'calArticle', title, excerpt, body, category, authorName, authorId: identity.user.id, publicationIntent: intent, publicationStatus: 'pending', ...(asset ? { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } } : {}) });
    return res.status(201).json({ message: 'Votre proposition a été envoyée à la rédaction.' });
  } catch (error) {
    console.error('article submission failed', error);
    return res.status(500).json({ message: error.message || 'Une erreur est survenue.' });
  }
};
