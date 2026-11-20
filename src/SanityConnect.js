import { createClient } from '@sanity/client';

const projectId = process.env.REACT_APP_SANITY_PROJECT_ID;
const dataset = process.env.REACT_APP_SANITY_DATASET || 'production';

export const client = projectId ? createClient({
  projectId,
  dataset,
  apiVersion: process.env.REACT_APP_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
}) : null;

export const homeQuery = `*[_type == "accueil"][0]{
  hero{..., "imageUrl": image.asset->url, "mobileImageUrl": mobileImage.asset->url},
  presentation, missions, actualites, quote, evenements, appel, footer
}`;

export const articleListQuery = `*[_type == "article" && (!defined(status) || status == "published")] | order(pinned desc, publishedAt desc) {
  _id, title, subtitle, summary, "slug": slug.current, publishedAt, readingTime, featured,
  "coverUrl": cover.asset->url, "category": category->{title, "slug": slug.current},
  "author": author->{name, "slug": slug.current}
}`;

export const articleBySlugQuery = `*[_type == "article" && (!defined(status) || status == "published") && slug.current == $slug][0]{
  ..., "coverUrl": cover.asset->url, "category": category->{title, "slug": slug.current},
  "author": author->{name, "slug": slug.current, role}, "related": related[]->{title, "slug": slug.current, summary, "coverUrl": cover.asset->url}
}`;

export const categoryQuery = `*[_type == "categorie" && slug.current == $slug][0]{title, description, "slug": slug.current}`;
export const articlesByCategoryQuery = `*[_type == "article" && status == "published" && category->slug.current == $slug] | order(publishedAt desc){_id, title, summary, "slug": slug.current, publishedAt, "coverUrl": cover.asset->url, "author": author->{name}}`;
export const authorQuery = `*[_type == "auteur" && slug.current == $slug][0]{name, role, bio, "photoUrl": photo.asset->url, "slug": slug.current}`;
export const articlesByAuthorQuery = `*[_type == "article" && status == "published" && author->slug.current == $slug] | order(publishedAt desc){_id, title, summary, "slug": slug.current, publishedAt, "coverUrl": cover.asset->url}`;
