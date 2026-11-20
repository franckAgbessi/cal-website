import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineField, defineType } from 'sanity';

export const evenement = defineType({
  name: 'evenement', title: 'Événement', type: 'document', icon: CalendarIcon,
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'date', title: 'Date', type: 'datetime', validation: rule => rule.required() }),
    defineField({ name: 'location', title: 'Lieu', type: 'string' }),
    defineField({ name: 'status', title: 'Statut', type: 'string', options: { list: ['À venir', 'Complet', 'Terminé'] }, initialValue: 'À venir' }),
    defineField({ name: 'link', title: 'Lien d’inscription ou de contact', type: 'url' }),
  ],
  preview: { select: { title: 'title', subtitle: 'date', media: 'image' } },
});
