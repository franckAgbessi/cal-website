import { defineField, defineType } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Landing page — Accueil',
  type: 'document',
  groups: [
    { name: 'hero', title: '01 — Bannière principale', default: true },
    { name: 'circle', title: '02 — Section « Le Cercle »' },
    { name: 'journal', title: '03 — Aperçu de la revue' },
    { name: 'quote', title: '04 — Citation' },
    { name: 'contact', title: '05 — Section contact' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    defineField({ name: 'heroTitle', title: 'Titre principal', description: 'Grand titre au sommet de la landing page.', type: 'string', group: 'hero', validation: (rule) => rule.required() }),
    defineField({ name: 'heroSubtitle', title: 'Surtitre', description: 'Texte court en capitales au-dessus du titre.', type: 'string', group: 'hero' }),
    defineField({ name: 'heroDescription', title: 'Texte d’introduction', type: 'text', rows: 4, group: 'hero' }),
    defineField({ name: 'heroImage', title: 'Image de fond', description: 'Photo pleine largeur derrière le titre.', type: 'richImage', group: 'hero' }),
    defineField({ name: 'heroPrimaryCTA', title: 'Bouton « Découvrir notre cercle »', type: 'cta', group: 'hero' }),
    defineField({ name: 'heroSecondaryCTA', title: 'Bouton « Lire nos publications »', type: 'cta', group: 'hero' }),
    defineField({ name: 'introductionTitle', title: 'Titre de section', description: 'Titre affiché dans la partie « Le Cercle ».', type: 'string', group: 'circle' }),
    defineField({ name: 'introductionText', title: 'Texte de présentation', type: 'text', rows: 5, group: 'circle' }),
    defineField({ name: 'introductionImage', title: 'Image de la section', type: 'richImage', group: 'circle' }),
    defineField({ name: 'featuredArticlesTitle', title: 'Titre de l’aperçu', description: 'La liste elle-même provient uniquement des articles publiés dans Sanity.', type: 'string', group: 'journal' }),
    defineField({ name: 'featuredArticlesDescription', title: 'Texte d’introduction', type: 'text', rows: 3, group: 'journal' }),
    defineField({ name: 'historicalQuote', title: 'Texte de la citation', type: 'text', rows: 3, group: 'quote' }),
    defineField({ name: 'historicalQuoteAuthor', title: 'Auteur et source', description: 'N’ajouter que des citations vérifiables et correctement sourcées.', type: 'string', group: 'quote' }),
    defineField({ name: 'joinSection', title: 'Bloc « Faire vivre notre héritage »', description: 'Titre, texte et bouton de la dernière section de contact.', type: 'editorialSection', group: 'contact' }),
    defineField({ name: 'seo', title: 'SEO de l’accueil', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Landing page — Accueil' }) },
});
