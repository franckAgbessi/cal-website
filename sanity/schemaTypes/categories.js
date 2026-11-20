import { TagIcon } from '@sanity/icons/Tag';
import { defineField, defineType } from 'sanity';

export const categorie = defineType({
  name: 'categorie', title: 'Catégorie', type: 'document', icon: TagIcon,
  fields: [
    defineField({ name: 'title', title: 'Nom', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: rule => rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'color', title: 'Couleur éditoriale', type: 'string' }),
  ],
  preview: { select: { title: 'title', media: 'image' } },
});
