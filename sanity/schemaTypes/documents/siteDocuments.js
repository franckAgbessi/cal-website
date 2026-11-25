import { defineField, defineType } from 'sanity';

export const category = defineType({ name: 'category', title: 'Catégorie', type: 'document', fields: [defineField({ name: 'title', title: 'Titre', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }), defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }), defineField({ name: 'order', title: 'Ordre', type: 'number' })], preview: { select: { title: 'title' } } });
export const author = defineType({ name: 'author', title: 'Auteur', type: 'document', fields: [defineField({ name: 'name', title: 'Nom', type: 'string', validation: (rule) => rule.required() }), defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (rule) => rule.required() }), defineField({ name: 'portrait', title: 'Portrait', type: 'richImage' }), defineField({ name: 'biography', title: 'Biographie', type: 'array', of: [{ type: 'block' }] }), defineField({ name: 'role', title: 'Fonction', type: 'string' })], preview: { select: { title: 'name', subtitle: 'role', media: 'portrait' } } });

export const siteSettings = defineType({
  name: 'siteSettings', title: 'Paramètres globaux', type: 'document',
  groups: [{ name: 'identity', title: 'Identité', default: true }, { name: 'contact', title: 'Coordonnées & réseaux' }, { name: 'footer', title: 'Pied de page' }, { name: 'seo', title: 'Référencement' }],
  fields: [
    defineField({ name: 'siteName', title: 'Nom du site', type: 'string', group: 'identity', validation: (rule) => rule.required() }),
    defineField({ name: 'siteDescription', title: 'Description institutionnelle', type: 'text', rows: 3, group: 'identity' }),
    defineField({ name: 'logo', title: 'Logo', type: 'richImage', group: 'identity' }),
    defineField({ name: 'favicon', title: 'Favicon', type: 'image', group: 'identity' }),
    defineField({ name: 'contactEmail', title: 'E-mail de contact', type: 'email', group: 'contact' }),
    defineField({ name: 'socialLinks', title: 'Réseaux sociaux', type: 'array', of: [{ type: 'object', fields: [defineField({ name: 'label', title: 'Nom', type: 'string' }), defineField({ name: 'url', title: 'URL', type: 'url' })] }], group: 'contact' }),
    defineField({ name: 'navigation', title: 'Navigation', type: 'array', of: [{ type: 'cta' }], group: 'identity' }),
    defineField({ name: 'footerDescription', title: 'Texte institutionnel', type: 'text', rows: 3, group: 'footer' }),
    defineField({ name: 'footerLinks', title: 'Liens du pied de page', type: 'array', of: [{ type: 'cta' }], group: 'footer' }),
    defineField({ name: 'defaultSeoImage', title: 'Image de partage par défaut', type: 'richImage', group: 'seo' }),
    defineField({ name: 'seo', title: 'SEO global', type: 'seo', group: 'seo' }),
  ], preview: { prepare: () => ({ title: 'Paramètres globaux' }) },
});

const landingGroups = [
  { name: 'header', title: 'En-tête de section', default: true },
  { name: 'content', title: 'Contenu de la section' },
  { name: 'media', title: 'Images & références' },
  { name: 'seo', title: 'Référencement' },
];

const landingFields = (withReferences = false) => [
  defineField({ name: 'title', title: 'Titre de section', description: 'Titre visible dans la landing page.', type: 'string', group: 'header', validation: (rule) => rule.required() }),
  defineField({ name: 'introduction', title: 'Texte d’introduction', type: 'text', rows: 5, group: 'header' }),
  defineField({ name: 'sections', title: 'Blocs éditoriaux', description: 'Chaque bloc correspond à une ligne ou à un repère visible dans cette section.', type: 'array', of: [{ type: 'editorialSection' }], group: 'content' }),
  defineField({ name: 'images', title: 'Images complémentaires', type: 'array', of: [{ type: 'richImage' }], group: 'media' }),
  ...(withReferences ? [defineField({ name: 'illustrations', title: 'Illustrations de la section', type: 'array', of: [{ type: 'richImage' }], group: 'media' }), defineField({ name: 'references', title: 'Références historiques', type: 'array', of: [{ type: 'historicalReference' }], group: 'media' })] : []),
  defineField({ name: 'seo', title: 'SEO de la section', type: 'seo', group: 'seo' }),
];

export const aboutPage = defineType({
  name: 'aboutPage', title: 'Landing — Section « Le Cercle »', type: 'document', groups: [...landingGroups, { name: 'details', title: 'Détails complémentaires' }],
  fields: [...landingFields(), defineField({ name: 'history', title: 'Notre histoire', type: 'array', of: [{ type: 'block' }], group: 'details' }), defineField({ name: 'missions', title: 'Nos missions', type: 'array', of: [{ type: 'editorialSection' }], group: 'details' }), defineField({ name: 'callsToAction', title: 'Appels à l’action', type: 'array', of: [{ type: 'cta' }], group: 'details' })],
  preview: { prepare: () => ({ title: 'Landing — Section « Le Cercle »' }) },
});

export const historyPage = defineType({
  name: 'historyPage', title: 'Landing — Section « Histoire & patrimoine »', type: 'document', groups: landingGroups, fields: landingFields(true),
  preview: { prepare: () => ({ title: 'Landing — Section « Histoire & patrimoine »' }) },
});

export const contactPage = defineType({
  name: 'contactPage', title: 'Landing — Section « Contact »', type: 'document',
  groups: [{ name: 'content', title: 'Texte de la section', default: true }, { name: 'details', title: 'Coordonnées', }, { name: 'seo', title: 'Référencement' }],
  fields: [
    defineField({ name: 'title', title: 'Titre de la section', description: 'Titre affiché en bas de la landing page.', type: 'string', group: 'content', validation: (rule) => rule.required() }),
    defineField({ name: 'description', title: 'Texte d’accompagnement', type: 'text', rows: 4, group: 'content' }),
    defineField({ name: 'contactInformation', title: 'Coordonnées visibles', type: 'object', group: 'details', fields: [defineField({ name: 'email', title: 'E-mail', type: 'email' }), defineField({ name: 'address', title: 'Adresse', type: 'text', rows: 2 })] }),
    defineField({ name: 'socialLinks', title: 'Réseaux sociaux', type: 'array', of: [{ type: 'cta' }], group: 'details' }),
    defineField({ name: 'seo', title: 'SEO de la section', type: 'seo', group: 'seo' }),
  ], preview: { prepare: () => ({ title: 'Landing — Section « Contact »' }) },
});
