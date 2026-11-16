import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineField, defineType } from 'sanity';

export const calArticle = defineType({
  name: 'calArticle',
  title: 'Article de Presse / Gazette',
  type: 'document',
  icon: DocumentTextIcon,
  fieldsets: [
    { name: 'titrage', title: '1. Titrage & Chapeau journalistique', options: { collapsible: true, collapsed: false } },
    { name: 'signature', title: '2. Signature, Auteur & Territoire', options: { collapsible: true, collapsed: false } },
    { name: 'media', title: '3. Photographies & Reportage visuel', options: { collapsible: true, collapsed: false } },
    { name: 'contenu', title: '4. Corps du texte, Citations & Encadré Repères', options: { collapsible: true, collapsed: false } },
    { name: 'diffusion', title: '5. Diffusion (Gazette / Site principal)', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    // --- 1. Titrage & Chapeau ---
    defineField({
      name: 'kicker',
      title: 'Surtitre (Rubrique d’accroche)',
      type: 'string',
      fieldset: 'titrage',
      placeholder: 'ex: ENQUÊTE, REPORTAGE, TRIBUNE, VIE LOCALE, EXCLUSIF, DOSSIER',
      description: 'Accroche placée au-dessus du titre (en majuscules rouges, style Le Monde / La Dépêche).',
      validation: rule => rule.max(60),
    }),
    defineField({
      name: 'title',
      title: 'Grand Titre principal',
      type: 'string',
      fieldset: 'titrage',
      description: 'Le titre percutant de l’article.',
      validation: rule => rule.required().max(160),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sous-titre / Relance de lecture',
      type: 'string',
      fieldset: 'titrage',
      description: 'Complément de lecture pour contextualiser le titre.',
      validation: rule => rule.max(280),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant URL (Slug)',
      type: 'slug',
      fieldset: 'titrage',
      options: { source: 'title', maxLength: 100 },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Chapô journalistique (Introduction)',
      type: 'text',
      rows: 3,
      fieldset: 'titrage',
      description: 'Paragraphe d’accroche mis en exergue en tête d’article.',
      validation: rule => rule.required().max(500),
    }),
    defineField({
      name: 'readingTime',
      title: 'Temps de lecture (minutes)',
      type: 'number',
      fieldset: 'titrage',
      initialValue: 3,
      validation: rule => rule.min(1).max(60),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Mettre à la Une (Article phare)',
      type: 'boolean',
      fieldset: 'titrage',
      initialValue: false,
      description: 'L’article sera mis en avant au sommet du journal.',
    }),

    // --- 2. Signature, Auteur & Territoire ---
    defineField({
      name: 'location',
      title: 'Territoire / Ville / Lieu du reportage',
      type: 'string',
      fieldset: 'signature',
      placeholder: 'ex: Toulouse, Nantes, Occitanie, Lyon, Paris',
      description: 'Ancrage territorial (très prisé en presse régionale type La Dépêche).',
    }),
    defineField({
      name: 'authorName',
      title: 'Nom ou signature de l’auteur·rice',
      type: 'string',
      fieldset: 'signature',
      validation: rule => rule.required().max(80),
    }),
    defineField({
      name: 'authorRole',
      title: 'Qualité ou fonction',
      type: 'string',
      fieldset: 'signature',
      placeholder: 'ex: Grand reporter, Envoyé spécial, Délégué de cercle, Correspondant local',
    }),
    defineField({
      name: 'authorAvatar',
      title: 'Portrait / Photo de l’auteur·rice',
      type: 'image',
      fieldset: 'signature',
      options: { hotspot: true },
    }),

    // --- 3. Photographies & Médias ---
    defineField({
      name: 'image',
      title: 'Photographie principale (À la Une)',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Description pour malvoyants (Alt)',
          type: 'string',
          validation: rule => rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Légende journalistique',
          type: 'string',
          placeholder: 'Explication de la scène photographiée...',
        }),
        defineField({
          name: 'credit',
          title: 'Crédit photo / Agence',
          type: 'string',
          placeholder: 'ex: AFP, CAL Médias, Reuters, Archives cercle',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie de reportage (Photos secondaires)',
      type: 'array',
      fieldset: 'media',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' }),
            defineField({ name: 'caption', title: 'Légende', type: 'string' }),
            defineField({ name: 'credit', title: 'Crédit', type: 'string' }),
          ],
        },
      ],
      description: 'Photos complémentaires insérées dans le reportage.',
    }),

    // --- 4. Corps, Citation & Encadré Repères ---
    defineField({
      name: 'quote',
      title: 'Citation en exergue (Pull-quote)',
      type: 'object',
      fieldset: 'contenu',
      description: 'Phrase forte extraite de l’article pour rythmer la mise en page (style Le Monde).',
      fields: [
        defineField({ name: 'text', title: 'Texte de la citation', type: 'text', rows: 2 }),
        defineField({ name: 'author', title: 'Personnalité ou source citée', type: 'string' }),
      ],
    }),
    defineField({
      name: 'factbox',
      title: 'Encadré « Repères / En chiffres » (Facultatif)',
      type: 'object',
      fieldset: 'contenu',
      description: 'Encadré synthétique pour résumer les points clés (typique de la presse écrite).',
      fields: [
        defineField({ name: 'title', title: 'Titre de l’encadré', type: 'string', placeholder: 'ex: Les chiffres clés, Repères, À savoir' }),
        defineField({ name: 'items', title: 'Points clés (un par ligne)', type: 'array', of: [{ type: 'string' }] }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Corps de l’article (Texte intégral)',
      type: 'text',
      rows: 22,
      fieldset: 'contenu',
      description: 'Le texte complet du reportage ou de l’enquête.',
      validation: rule => rule.required().max(25000),
    }),

    // --- 5. Diffusion & Publication ---
    defineField({
      name: 'category',
      title: 'Rubrique principale',
      type: 'string',
      fieldset: 'diffusion',
      options: {
        list: [
          'Vie locale',
          'Initiative',
          'Enquête & Reportage',
          'Idées & Débats',
          'Portrait',
          'Culture',
          'Tribune',
          'Agenda & Rencontres',
        ],
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Mots-clés / Tags thématiques',
      type: 'array',
      fieldset: 'diffusion',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'publicationStatus',
      title: 'Destination de diffusion',
      type: 'string',
      fieldset: 'diffusion',
      initialValue: 'both',
      options: {
        list: [
          { title: '🌟 Gazette ET Site principal (Accueil)', value: 'both' },
          { title: '🔒 Gazette des membres uniquement', value: 'gazette' },
          { title: '🌐 Site principal uniquement', value: 'main' },
          { title: '📝 Brouillon / En relecture', value: 'draft' },
          { title: '📦 Archivé', value: 'archived' },
        ],
        layout: 'radio',
      },
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'officialPublishedAt',
      title: 'Date et heure de parution',
      type: 'datetime',
      fieldset: 'diffusion',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Plus récents',
      name: 'newest',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'officialPublishedAt', direction: 'desc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'authorName',
      location: 'location',
      kicker: 'kicker',
      category: 'category',
      status: 'publicationStatus',
      media: 'image',
    },
    prepare({ title, subtitle, location, kicker, category, status, media }) {
      const loc = location ? `[${location}] ` : '';
      const kick = kicker ? `[${kicker}] ` : category ? `[${category}] ` : '';
      const statusIcon = status === 'both' ? '🌟' : status === 'gazette' ? '🔒' : status === 'main' ? '🌐' : '📝';
      return {
        title: `${statusIcon} ${loc}${kick}${title || 'Sans titre'}`,
        subtitle: subtitle ? `Par ${subtitle}` : '',
        media,
      };
    },
  },
});
