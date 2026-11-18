import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';

export const accueil = defineType({
  name: 'accueil',
  title: 'Héro Accueil (Titre & Image)',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo optionnel du Héro (au-dessus du surtitre)',
      type: 'image',
      fields: [
        defineField({ name: 'alt', title: 'Texte descriptif (Alt)', type: 'string' }),
      ],
    }),
    defineField({
      name: 'surtitre',
      title: 'Surtitre',
      type: 'string',
      placeholder: 'Transmission · Enracinement · Action',
    }),
    defineField({
      name: 'titre',
      title: 'Titre principal',
      type: 'string',
      placeholder: 'Un héritage vivant.',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'titreSuite',
      title: 'Suite du titre (deuxième ligne)',
      type: 'string',
      placeholder: 'Un avenir',
    }),
    defineField({
      name: 'accent',
      title: 'Mot mis en valeur (couleur or)',
      type: 'string',
      placeholder: 'à bâtir.',
    }),
    defineField({
      name: 'description',
      title: 'Texte d’introduction / description',
      type: 'text',
      rows: 4,
      placeholder: 'Se former, se structurer et agir au service du Bien Commun...',
    }),
    defineField({
      name: 'image',
      title: 'Grande image d’illustration (droite)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Texte descriptif (Alt)', type: 'string' }),
      ],
    }),
    defineField({
      name: 'boutonPrincipal',
      title: 'Bouton principal',
      type: 'object',
      fields: [
        defineField({ name: 'texte', title: 'Texte du bouton', type: 'string', placeholder: 'Adhérer au mouvement' }),
        defineField({ name: 'lien', title: 'Lien (ex: #Territoire)', type: 'string', placeholder: '#Territoire' }),
      ],
    }),
    defineField({
      name: 'boutonSecondaire',
      title: 'Bouton secondaire',
      type: 'object',
      fields: [
        defineField({ name: 'texte', title: 'Texte du bouton', type: 'string', placeholder: 'Découvrir nos actions' }),
        defineField({ name: 'lien', title: 'Lien (ex: #journal)', type: 'string', placeholder: '#journal' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'titre',
      subtitle: 'surtitre',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Héro Accueil',
        subtitle: subtitle || 'Textes et image d’accueil',
        media,
      };
    },
  },
});
