import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';

export const auteur = defineType({
  name: 'auteur', title: 'Auteur', type: 'document', icon: UserIcon,
  fields: [
    defineField({ name: 'name', title: 'Nom', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: rule => rule.required() }),
    defineField({ name: 'photo', title: 'Photographie', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Biographie', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'role', title: 'Fonction', type: 'string' }),
    defineField({ name: 'socials', title: 'Réseaux sociaux', type: 'array', of: [{ type: 'object', fields: [defineField({ name: 'label', title: 'Nom', type: 'string' }), defineField({ name: 'url', title: 'URL', type: 'url' })] }] }),
  ],
  preview: { select: { title: 'name', media: 'photo', subtitle: 'role' } },
});
