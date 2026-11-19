import defaults from './defaultContent.json';

export const siteQuery = `*[_type == "calSite"] | order(_updatedAt desc)[0] {
  navigation {
    ...,
    logo {..., "url": asset->url},
    adhesion {..., "label": coalesce(label, texte), "href": coalesce(href, lien)},
    soutien {..., "label": coalesce(label, texte), "href": coalesce(href, lien)}
  },
  "accueil": coalesce(
    accueil {
      ...,
      "logo": { "alt": coalesce(logo.alt, alt), "url": logo.asset->url },
      "image": { "alt": coalesce(image.alt, alt), "url": image.asset->url },
      "principal": { "label": coalesce(principal.label, principal.texte, boutonPrincipal.texte, boutonPrincipal.label), "href": coalesce(principal.href, principal.lien, boutonPrincipal.lien, boutonPrincipal.href) },
      "secondaire": { "label": coalesce(secondaire.label, secondaire.texte, boutonSecondaire.texte, boutonSecondaire.label), "href": coalesce(secondaire.href, secondaire.lien, boutonSecondaire.lien, boutonSecondaire.href) }
    },
    *[_type == "accueil"] | order(_updatedAt desc)[0] {
      surtitre,
      titre,
      titreSuite,
      accent,
      description,
      "logo": { "alt": coalesce(logo.alt, alt), "url": logo.asset->url },
      "image": { "alt": coalesce(image.alt, alt), "url": image.asset->url },
      "principal": { "label": coalesce(principal.label, principal.texte, boutonPrincipal.texte, boutonPrincipal.label), "href": coalesce(principal.href, principal.lien, boutonPrincipal.lien, boutonPrincipal.href) },
      "secondaire": { "label": coalesce(secondaire.label, secondaire.texte, boutonSecondaire.texte, boutonSecondaire.label), "href": coalesce(secondaire.href, secondaire.lien, boutonSecondaire.lien, boutonSecondaire.href) }
    }
  ),
  manifeste,
  territoires {..., cercles[] {..., logo {..., "url": asset->url}}},
  formulaire,
  footer {
    ...,
    logo {..., "url": asset->url},
    soutien {..., "label": coalesce(label, texte), "href": coalesce(href, lien)}
  }
}`;

// Only articles explicitly approved for the public site are exposed here.
// Member submissions stay behind the authenticated API.
export const officialArticlesQuery = `*[_type == "calArticle" && (publicationStatus in ["both", "main", "official"])] | order(isFeatured desc, officialPublishedAt desc, _createdAt desc)[0...12] {
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

// Null or missing fields retain the existing site; empty arrays deliberately hide items.
export function mergeContent(base, incoming) {
  if (incoming == null) return base;
  if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : base;
  if (base && typeof base === 'object') {
    return Object.fromEntries(Object.keys({...base, ...incoming}).map(key => [
      key, mergeContent(base[key], incoming[key]),
    ]));
  }
  return incoming;
}

export function safeHref(value) {
  return typeof value === 'string' && /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(value.trim())
    ? value.trim() : undefined;
}

/**
 * Optimise une URL d'image Sanity CDN avec WebP/AVIF automatique, compression et redimensionnement.
 */
export function getOptimizedImageUrl(url, { width, height, quality = 75, fit = 'max' } = {}) {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cdn.sanity.io')) return url;

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('auto', 'format');
    if (quality) urlObj.searchParams.set('q', String(quality));
    if (width) urlObj.searchParams.set('w', String(width));
    if (height) urlObj.searchParams.set('h', String(height));
    if (fit) urlObj.searchParams.set('fit', fit);
    return urlObj.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    const params = ['auto=format'];
    if (quality) params.push(`q=${quality}`);
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (fit) params.push(`fit=${fit}`);
    return `${url}${sep}${params.join('&')}`;
  }
}

/**
 * Génère un attribut srcSet réactif pour les différentes résolutions d'écran.
 */
export function getOptimizedSrcSet(url, widths = [320, 480, 768, 1024]) {
  if (!url || typeof url !== 'string' || !url.includes('cdn.sanity.io')) return undefined;
  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w, quality: 75 })} ${w}w`)
    .join(', ');
}

const SITE_CONTENT_CACHE_KEY = 'cal_site_content_cache';
const ARTICLES_CACHE_KEY = 'cal_official_articles_cache';

/**
 * Récupère le contenu du site mis en cache localement (SWR).
 */
export function getCachedContent() {
  if (typeof window === 'undefined' || !window.localStorage) return defaults;
  try {
    const cached = window.localStorage.getItem(SITE_CONTENT_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      return mergeContent(defaults, data);
    }
  } catch {}
  return defaults;
}

/**
 * Sauvegarde le contenu du site dans le cache local.
 */
export function setCachedContent(data) {
  if (typeof window === 'undefined' || !window.localStorage || !data) return;
  try {
    window.localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Récupère les articles officiels mis en cache localement (SWR).
 */
export function getCachedArticles() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const cached = window.localStorage.getItem(ARTICLES_CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}
  return [];
}

/**
 * Sauvegarde les articles officiels dans le cache local.
 */
export function setCachedArticles(articles) {
  if (typeof window === 'undefined' || !window.localStorage || !Array.isArray(articles)) return;
  try {
    window.localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(articles));
  } catch {}
}

export { defaults };
