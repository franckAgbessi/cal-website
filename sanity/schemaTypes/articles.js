import { EditIcon } from '@sanity/icons/Edit';
import { defineField, defineType } from 'sanity';

const seo = defineField({ name: 'seo', title: 'SEO', type: 'object', fields: [
  defineField({ name: 'title', title: 'Titre SEO', type: 'string', validation: rule => rule.max(60) }),
  defineField({ name: 'description', title: 'Description SEO', type: 'text', rows: 3, validation: rule => rule.max(160) }),
  defineField({ name: 'socialImage', title: 'Image de partage', type: 'image' }),
] });

export const article = defineType({
  name: 'article', title: 'Article', type: 'document', icon: EditIcon,
  groups: [{ name: 'content', title: 'Contenu', default: true }, { name: 'publication', title: 'Publication' }, { name: 'media', title: 'Médias' }, { name: 'seo', title: 'SEO' }],
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', group: 'content', validation: rule => rule.required() }),
    defineField({ name: 'subtitle', title: 'Sous-titre / chapô', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'slug', title: 'Slug URL', type: 'slug', group: 'publication', options: { source: 'title', maxLength: 96 }, validation: rule => rule.required() }),
    defineField({ name: 'cover', title: 'Image de couverture', type: 'image', group: 'media', options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: 'coverAlternative', title: 'Image de couverture alternative', type: 'image', group: 'media' }),
    defineField({ name: 'caption', title: 'Légende', type: 'string', group: 'media' }), defineField({ name: 'credit', title: 'Crédit photographique', type: 'string', group: 'media' }),
    defineField({ name: 'author', title: 'Auteur', type: 'reference', to: [{ type: 'auteur' }], group: 'publication', validation: rule => rule.required() }),
    defineField({ name: 'category', title: 'Catégorie', type: 'reference', to: [{ type: 'categorie' }], group: 'publication', validation: rule => rule.required() }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], group: 'publication' }),
    defineField({ name: 'publishedAt', title: 'Date de publication', type: 'datetime', group: 'publication', validation: rule => rule.required() }),
    defineField({ name: 'readingTime', title: 'Temps de lecture (minutes)', type: 'number', group: 'publication', validation: rule => rule.min(1) }),
    defineField({ name: 'status', title: 'Statut éditorial', type: 'string', group: 'publication', options: { list: [{ title: 'Brouillon', value: 'draft' }, { title: 'Publié', value: 'published' }, { title: 'Archivé', value: 'archived' }], layout: 'radio' }, initialValue: 'draft' }),
    defineField({ name: 'featured', title: 'Article à la une', type: 'boolean', group: 'publication', initialValue: false }),
    defineField({ name: 'pinned', title: 'Article épinglé', type: 'boolean', group: 'publication', initialValue: false }),
    defineField({ name: 'summary', title: 'Résumé', type: 'text', rows: 4, group: 'content' }),
    defineField({ name: 'body', title: 'Contenu', type: 'array', group: 'content', of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Titre 2', value: 'h2' }, { title: 'Titre 3', value: 'h3' }, { title: 'Titre 4', value: 'h4' }, { title: 'Citation', value: 'blockquote' }], lists: [{ title: 'Numérotée', value: 'number' }, { title: 'Puces', value: 'bullet' }], marks: { decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }], annotations: [{ name: 'link', type: 'object', fields: [defineField({ name: 'href', title: 'URL', type: 'url' })] }] } }, { type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'caption', title: 'Légende', type: 'string' }), defineField({ name: 'credit', title: 'Crédit', type: 'string' })] }] }),
    defineField({ name: 'related', title: 'Articles associés', type: 'array', of: [{ type: 'reference', to: [{ type: 'article' }] }], group: 'content' }),
    seo,
  ],
  preview: { select: { title: 'title', subtitle: 'category.title', media: 'cover' } },
});
