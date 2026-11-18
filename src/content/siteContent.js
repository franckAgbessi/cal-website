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

export { defaults };
