import { client, sanityClient } from './SanityConnect';

const storageKey = 'cal-session';

/**
 * Hachage SHA-256 dans le navigateur via l'API Web Crypto native.
 */
export async function hashPassword(str) {
  if (!str) return '';
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSession() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || 'null');
  } catch {
    return null;
  }
}

export function signOut() {
  window.localStorage.removeItem(storageKey);
}

/**
 * Connexion d'un membre via Sanity (sans backend externe).
 */
export async function signIn(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error('Veuillez renseigner votre email et votre mot de passe.');
  }

  // Requête directe dans Sanity
  const member = await sanityClient.fetch(
    `*[_type == "calMember" && lower(email) == $email && active != false][0] {
      _id,
      displayName,
      email,
      role,
      active,
      password
    }`,
    { email: normalizedEmail }
  );

  if (!member) {
    throw new Error('Email ou mot de passe incorrect, ou compte inactif.');
  }

  const hashedPassword = await hashPassword(password);
  // Tolère le mot de passe hashé ou en clair si créé manuellement dans Sanity Studio
  const isValid = member.password === hashedPassword || member.password === password;

  if (!isValid) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  const session = {
    user: {
      id: member._id,
      displayName: member.displayName || member.email,
      email: member.email,
      role: member.role || 'member',
    },
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(session));
  return session;
}

/**
 * Création d'un nouvel utilisateur membre directement dans Sanity.
 */
export async function signUp({ displayName, email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const name = (displayName || '').trim();

  if (!name || !normalizedEmail || !password) {
    throw new Error('Veuillez remplir tous les champs.');
  }
  if (password.length < 6) {
    throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
  }

  // Vérifier si un membre existe déjà avec cet email
  const existing = await sanityClient.fetch(
    `*[_type == "calMember" && lower(email) == $email][0]._id`,
    { email: normalizedEmail }
  );
  if (existing) {
    throw new Error('Un compte existe déjà avec cette adresse email.');
  }

  const hashedPassword = await hashPassword(password);
  const newMember = await sanityClient.create({
    _type: 'calMember',
    displayName: name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'member',
    active: true,
    createdAt: new Date().toISOString(),
  });

  const session = {
    user: {
      id: newMember._id,
      displayName: newMember.displayName,
      email: newMember.email,
      role: newMember.role || 'member',
    },
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(session));
  return session;
}

/**
 * Récupération des articles officiels publiés depuis Sanity.
 */
export async function fetchOfficialArticles(signal) {
  const query = `*[_type == "calArticle" && (publicationStatus in ["both", "main", "official"])] | order(isFeatured desc, officialPublishedAt desc, _createdAt desc)[0...12] {
    _id,
    "_key": _id,
    category,
    location,
    kicker,
    title,
    subtitle,
    excerpt,
    body,
    "description": coalesce(excerpt, body),
    readingTime,
    isFeatured,
    quote,
    factbox,
    tags,
    "href": "/cal#article-" + _id,
    image { alt, caption, credit, "url": asset->url },
    gallery[] { alt, caption, credit, "url": asset->url },
    authorName,
    authorRole,
    authorAvatar { "url": asset->url },
    officialPublishedAt,
    publicationStatus
  }`;

  try {
    const data = await client.fetch(query, {}, { signal });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('Impossible de charger les articles officiels depuis Sanity:', error);
    }
    return [];
  }
}

/**
 * Récupération des articles de la gazette pour les membres connectés.
 * Projette l'ensemble des données éditoriales riches.
 */
export async function fetchMemberArticles(signal) {
  const query = `*[_type == "calArticle" && (publicationStatus in ["both", "gazette", "members", "main", "official"] || !defined(publicationStatus))] | order(isFeatured desc, officialPublishedAt desc, _createdAt desc)[0...60] {
    _id,
    "_key": _id,
    category,
    location,
    kicker,
    title,
    subtitle,
    excerpt,
    body,
    "description": coalesce(excerpt, body),
    readingTime,
    isFeatured,
    quote,
    factbox,
    tags,
    "href": "/cal#article-" + _id,
    image { alt, caption, credit, "url": asset->url },
    gallery[] { alt, caption, credit, "url": asset->url },
    authorName,
    authorRole,
    authorAvatar { "url": asset->url },
    officialPublishedAt,
    publicationStatus,
    _createdAt
  }`;

  try {
    const data = await sanityClient.fetch(query, {}, { signal });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('Erreur chargement articles membres:', error);
    }
    return [];
  }
}

// Helpers d'activation conservés pour compatibilité d'URL
export function getInviteSession() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const email = params.get('email');
  return email ? { email } : null;
}

export function clearInviteHash() {
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
}

export async function setInitialPassword({ email }, password) {
  if (!email || !password || password.length < 6) {
    throw new Error('Mot de passe trop court ou email invalide.');
  }
  const member = await sanityClient.fetch(
    `*[_type == "calMember" && lower(email) == $email][0]._id`,
    { email: email.toLowerCase() }
  );
  if (!member) {
    throw new Error('Aucun compte trouvé avec cet email.');
  }
  const hashedPassword = await hashPassword(password);
  await sanityClient.patch(member).set({ password: hashedPassword, active: true }).commit();
  return signIn(email, password);
}
