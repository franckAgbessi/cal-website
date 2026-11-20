import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';

const link = (name, title) => defineField({
  name, title, type: 'object', options: { collapsible: true }, fields: [
    defineField({ name: 'label', title: 'Libellé', type: 'string' }),
    defineField({ name: 'href', title: 'Lien', type: 'string' }),
  ],
});

const image = (name, title) => defineField({
  name, title, type: 'image', options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Texte alternatif', type: 'string', validation: rule => rule.required() })],
});

export const accueil = defineType({
  name: 'accueil', title: 'Page d’accueil', type: 'document', icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Bannière principale', default: true },
    { name: 'presentation', title: 'Présentation' },
    { name: 'missions', title: 'Missions' },
    { name: 'actualites', title: 'Actualités' },
    { name: 'evenements', title: 'Événements' },
    { name: 'appel', title: 'Appel à l’action' },
    { name: 'footer', title: 'Pied de page' },
  ],
  fields: [
    defineField({ name: 'hero', title: 'Bannière principale', type: 'object', group: 'hero', initialValue: {
      visible: true,
      eyebrow: 'Cercle d’Action Légitimiste de Toulouse',
      title: 'Occitan Royaliste',
      description: 'Faire vivre l’histoire, transmettre notre héritage et cultiver la mémoire du royaume de France.',
      overlay: 35,
      textPosition: 'left',
      primaryButton: { label: 'Découvrir le cercle', href: '#cercle' },
      secondaryButton: { label: 'Nos publications', href: '#actualites' },
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre', type: 'string', validation: rule => rule.required() }),
      defineField({ name: 'eyebrow', title: 'Accroche', type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
      image('image', 'Image de fond'), image('mobileImage', 'Image mobile'),
      defineField({ name: 'overlay', title: 'Assombrissement (%)', type: 'number', validation: rule => rule.min(0).max(100) }),
      defineField({ name: 'textPosition', title: 'Position du texte', type: 'string', options: { list: ['left', 'center', 'right'], layout: 'radio' }, initialValue: 'left' }),
      link('primaryButton', 'Bouton principal'), link('secondaryButton', 'Bouton secondaire'),
    ] }),
    defineField({ name: 'presentation', title: 'Présentation du cercle', type: 'object', group: 'presentation', initialValue: {
      visible: true,
      title: 'Un héritage, une histoire, une transmission.',
      description: [{ _type: 'block', children: [{ _type: 'span', text: 'Le Cercle d’Action Légitimiste de Toulouse est un lieu de rencontre, d’étude et de transmission. Nous réunissons celles et ceux qui souhaitent mieux connaître l’histoire de France et le patrimoine occitan.' }] }],
      button: { label: 'En savoir plus', href: '#adhesion' },
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre', type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
      image('image', 'Photographie'), link('button', 'Bouton'),
    ] }),
    defineField({ name: 'missions', title: 'Nos engagements / Nos missions', type: 'object', group: 'missions', initialValue: {
      visible: true,
      title: 'Nos engagements',
      description: 'Étudier, partager et transmettre une mémoire vivante.',
      items: [
        { _key: 'etudier', title: 'Étudier', description: 'Approfondir l’histoire de France avec exigence et curiosité.' },
        { _key: 'partager', title: 'Partager', description: 'Faire de la culture un lien vivant entre les générations.' },
        { _key: 'transmettre', title: 'Transmettre', description: 'Protéger une mémoire et la confier à l’avenir.' },
      ],
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre de section', type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'text' }),
      defineField({ name: 'items', title: 'Cartes', type: 'array', of: [{ type: 'object', fields: [
        defineField({ name: 'title', title: 'Titre', type: 'string', validation: rule => rule.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        image('image', 'Image ou icône'), link('link', 'Lien'),
      ], preview: { select: { title: 'title', media: 'image' } } }] }),
    ] }),
    defineField({ name: 'actualites', title: 'Actualités à la une', type: 'object', group: 'actualites', initialValue: {
      visible: true, title: 'Dernières publications', description: 'Chroniques et études du cercle.', count: 3, automatic: true,
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre', type: 'string' }), defineField({ name: 'description', title: 'Description', type: 'text' }),
      defineField({ name: 'count', title: 'Nombre d’articles', type: 'number', initialValue: 3 }),
      defineField({ name: 'automatic', title: 'Afficher automatiquement les derniers articles', type: 'boolean', initialValue: true }),
      defineField({ name: 'featured', title: 'Articles sélectionnés', type: 'array', of: [{ type: 'reference', to: [{ type: 'article' }] }] }),
    ] }),
    defineField({ name: 'quote', title: 'Citation / Texte historique', type: 'object', group: 'presentation', fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'quote', title: 'Citation', type: 'text' }), defineField({ name: 'author', title: 'Auteur', type: 'string' }),
      defineField({ name: 'source', title: 'Source', type: 'string' }), image('background', 'Image de fond'),
    ] }),
    defineField({ name: 'evenements', title: 'Événements', type: 'object', group: 'evenements', initialValue: {
      visible: true, title: 'Les prochains événements', description: 'Conférences, rencontres et visites autour de l’histoire et du patrimoine.',
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre', type: 'string' }), defineField({ name: 'description', title: 'Description', type: 'text' }),
      defineField({ name: 'items', title: 'Événements mis en avant', type: 'array', of: [{ type: 'reference', to: [{ type: 'evenement' }] }] }),
    ] }),
    defineField({ name: 'appel', title: 'Appel à l’action', type: 'object', group: 'appel', initialValue: {
      visible: true, title: 'Rejoindre le cercle', text: 'Vous souhaitez participer à nos travaux, nos rencontres ou simplement en savoir davantage ? Écrivez-nous.',
      button: { label: 'Prendre contact', href: '#contact' },
    }, fields: [
      defineField({ name: 'visible', title: 'Afficher la section', type: 'boolean', initialValue: true }),
      defineField({ name: 'title', title: 'Titre', type: 'string' }), defineField({ name: 'text', title: 'Texte', type: 'text' }), image('image', 'Image'), link('button', 'Bouton'),
    ] }),
    defineField({ name: 'footer', title: 'Pied de page', type: 'object', group: 'footer', initialValue: {
      description: 'Un cercle d’étude et de transmission au cœur de Toulouse.',
      email: 'contact@occitan-royaliste.fr',
      legal: 'Les informations légales pourront être ajoutées ici.',
    }, fields: [
      defineField({ name: 'description', title: 'Présentation', type: 'text' }), image('logo', 'Logo'),
      defineField({ name: 'email', title: 'E-mail', type: 'email' }), defineField({ name: 'phone', title: 'Téléphone', type: 'string' }),
      defineField({
        name: 'socials',
        title: 'Réseaux sociaux',
        type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Nom', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        }],
      }),
      defineField({ name: 'legal', title: 'Mentions légales', type: 'text' }),
    ] }),
  ],
  preview: { select: { title: 'hero.title', media: 'hero.image' }, prepare: ({ title, media }) => ({ title: title || 'Page d’accueil', media }) },
});
