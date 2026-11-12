import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineField, defineType } from 'sanity';

export const calArticle = defineType({
  name: 'calArticle', title: 'Article de la Gazette', type: 'document', icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: rule => rule.required().max(120) }),
    defineField({ name: 'excerpt', title: 'Chapô', type: 'text', rows: 3, validation: rule => rule.required().max(300) }),
    defineField({ name: 'body', title: 'Article', type: 'text', rows: 16, validation: rule => rule.required().max(8000) }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', title: 'Texte alternatif', type: 'string', validation: rule => rule.warning('Décrivez l’image pour les lecteurs d’écran.') })] }),
    defineField({ name: 'category', title: 'Rubrique', type: 'string', options: { list: ['Vie locale', 'Initiative', 'Portrait', 'Débat'] }, validation: rule => rule.required() }),
    defineField({ name: 'authorName', title: 'Nom ou pseudo de l’auteur·rice', type: 'string', validation: rule => rule.required().max(60) }),
    defineField({ name: 'authorId', title: 'Identifiant membre', type: 'string', readOnly: true }),
    defineField({ name: 'publicationIntent', title: 'Demande de l’auteur·rice', type: 'string', options: { list: [{ title: 'Gazette des membres', value: 'members' }, { title: 'Proposition pour la page officielle', value: 'official-request' }], layout: 'radio' } }),
    defineField({ name: 'publicationStatus', title: 'Statut éditorial', type: 'string', initialValue: 'pending', options: { list: [{ title: 'À relire', value: 'pending' }, { title: 'Gazette des membres', value: 'members' }, { title: 'Page officielle', value: 'official' }, { title: 'Refusé', value: 'rejected' }], layout: 'radio' }, validation: rule => rule.required() }),
    defineField({ name: 'officialPublishedAt', title: 'Publié officiellement le', type: 'datetime', hidden: ({ parent }) => parent?.publicationStatus !== 'official' }),
  ],
  orderings: [{ title: 'Plus récents', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publicationStatus', media: 'image' } },
});
