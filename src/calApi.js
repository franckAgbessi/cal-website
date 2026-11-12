const storageKey = 'cal-session';

function configuration() {
  const runtime = typeof window !== 'undefined' ? window.__CAL_PUBLIC_CONFIG__ : null;
  const url = (runtime?.supabaseUrl || process.env.REACT_APP_SUPABASE_URL)?.replace(/\/$/, '');
  const key = runtime?.supabaseKey || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('La connexion n’est pas encore configurée.');
  return { url, key };
}

export function getSession() {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || 'null'); }
  catch { return null; }
}

export function getInviteSession() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const type = params.get('type');
  const accessToken = params.get('access_token');
  if (!accessToken || !['invite', 'recovery'].includes(type)) return null;
  return { accessToken, type };
}

export function clearInviteHash() {
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
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

export async function setInitialPassword(inviteSession, password) {
  const { url, key } = configuration();
  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: key, Authorization: `Bearer ${inviteSession.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Le mot de passe n’a pas pu être enregistré.');
  const session = { accessToken: inviteSession.accessToken, expiresAt: Date.now() + 3600 * 1000, user: data };
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
