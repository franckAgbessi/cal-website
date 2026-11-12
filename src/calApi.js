const storageKey = 'cal-session';

function configuration() {
  const url = process.env.REACT_APP_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('La connexion n’est pas encore configurée.');
  return { url, key };
}

export function getSession() {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || 'null'); }
  catch { return null; }
}

export async function signIn(email, password) {
  const { url, key } = configuration();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Email ou mot de passe incorrect.');
  const session = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000, user: data.user };
  window.localStorage.setItem(storageKey, JSON.stringify(session));
  return session;
}

export function signOut() { window.localStorage.removeItem(storageKey); }

export async function fetchOfficialArticles(signal) {
  const response = await fetch('/api/official-articles', { signal });
  if (!response.ok) throw new Error('La gazette est indisponible.');
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function submitArticle(session, article) {
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(article),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'La publication n’a pas pu être envoyée.');
  return data;
}
