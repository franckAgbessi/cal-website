import { BookIcon } from '@sanity/icons/Book';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { HomeIcon } from '@sanity/icons/Home';
import { MenuIcon } from '@sanity/icons/Menu';
import { PinIcon } from '@sanity/icons/Pin';
import { defineField, defineType } from 'sanity';

export const calSite = defineType({
  name: 'calSite',
  title: 'Page d’Accueil & Contenu du Site',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'accueil', title: '1. Héro Accueil', icon: HomeIcon, default: true },
    { name: 'navigation', title: '2. Navigation', icon: MenuIcon },
    { name: 'manifeste', title: '3. Manifeste', icon: BookIcon },
    { name: 'territoires', title: '4. Cercles & Carte', icon: PinIcon },
    { name: 'formulaire', title: '5. Formulaire', icon: EnvelopeIcon },
    { name: 'footer', title: '6. Pied de page' },
  ],
  fields: [
    // =========================================================================
    // 1. SECTION ACCUEIL (HÉRO)
    // =========================================================================
    defineField({
      name: 'accueil',
      title: 'Héro de la page d’accueil',
      type: 'object',
      group: 'accueil',
      description: 'Textes, titres, boutons et illustration tout en haut de la page.',
      fields: [
        defineField({
          name: 'logo',
          title: 'Logo optionnel du Héro',
          type: 'image',
          description: 'Blason ou emblème affiché au-dessus du surtitre (optionnel).',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Texte descriptif (Alt)', type: 'string' })],
        }),
        defineField({
          name: 'surtitre',
          title: 'Surtitre',
          type: 'string',
          placeholder: 'Transmission · Enracinement · Action',
        }),
        defineField({
          name: 'titre',
          title: 'Titre principal (première ligne)',
          type: 'string',
          placeholder: 'Un héritage vivant.',
          validation: rule => rule.required().error('Le titre principal est requis.'),
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
          description: 'Ce mot apparaît en lettres dorées à la fin du titre.',
        }),
        defineField({
          name: 'description',
          title: 'Texte d’introduction / description',
          type: 'text',
          rows: 3,
          placeholder: 'Se former, se structurer et agir au service du Bien Commun...',
        }),
        defineField({
          name: 'image',
          title: 'Grande image de droite (Héro)',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Texte descriptif (Alt)', type: 'string' }),
          ],
        }),
        defineField({
          name: 'principal',
          title: 'Bouton principal (fond plein)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Libellé du bouton', type: 'string', placeholder: 'Adhérer au mouvement' }),
            defineField({ name: 'href', title: 'Lien (ancre #Territoire ou URL)', type: 'string', placeholder: '#Territoire' }),
          ],
        }),
        defineField({
          name: 'secondaire',
          title: 'Bouton secondaire (contour)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Libellé du bouton', type: 'string', placeholder: 'Découvrir nos actions' }),
            defineField({ name: 'href', title: 'Lien (ancre #journal ou URL)', type: 'string', placeholder: '#journal' }),
          ],
        }),
      ],
    }),

    // =========================================================================
    // 2. NAVIGATION (EN-TÊTE)
    // =========================================================================
    defineField({
      name: 'navigation',
      title: 'Barre de navigation supérieure',
      type: 'object',
      group: 'navigation',
      fields: [
        defineField({
          name: 'logo',
          title: 'Logo principal du site',
          type: 'image',
          fields: [defineField({ name: 'alt', title: 'Texte alternatif du logo', type: 'string' })],
        }),
        defineField({
          name: 'liens',
          title: 'Liens du menu de navigation',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Libellé affiché', type: 'string', validation: rule => rule.required() }),
                defineField({ name: 'href', title: 'Cible (#section ou URL)', type: 'string', validation: rule => rule.required() }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'href' },
              },
            },
          ],
        }),
        defineField({
          name: 'adhesion',
          title: 'Bouton Adhérer (Navigation)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Texte', type: 'string', placeholder: 'Adhérer au mouvement' }),
            defineField({ name: 'href', title: 'Lien', type: 'string', placeholder: '#Territoire' }),
          ],
        }),
        defineField({
          name: 'soutien',
          title: 'Bouton Soutenir (Navigation)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Texte', type: 'string', placeholder: 'Soutenir nos actions' }),
            defineField({ name: 'href', title: 'Lien', type: 'string' }),
          ],
        }),
      ],
    }),

    // =========================================================================
    // 3. MANIFESTE & PRINCIPES
    // =========================================================================
    defineField({
      name: 'manifeste',
      title: 'Section Manifeste',
      type: 'object',
      group: 'manifeste',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string', placeholder: 'NOS PRINCIPES' }),
        defineField({ name: 'titre', title: 'Titre principal', type: 'string', placeholder: 'Des convictions qui nous lient.' }),
        defineField({ name: 'description', title: 'Texte d’introduction (optionnel)', type: 'text', rows: 3 }),
        defineField({
          name: 'principes',
          title: 'Principes du mouvement (Cartes numérotées)',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'titre', title: 'Titre du principe (ex: 01 Qui sommes nous ?)', type: 'string', validation: rule => rule.required() }),
                defineField({ name: 'texte', title: 'Texte explicatif (utilisez le tiret demi-cadratin – pour les points)', type: 'text', rows: 5, validation: rule => rule.required() }),
              ],
              preview: {
                select: { title: 'titre', subtitle: 'texte' },
              },
            },
          ],
        }),
      ],
    }),

    // =========================================================================
    // 4. TERRITOIRES & CARTE INTERACTIVE
    // =========================================================================
    defineField({
      name: 'territoires',
      title: 'Section Territoires & Carte',
      type: 'object',
      group: 'territoires',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string', placeholder: 'NOS TERRITOIRES' }),
        defineField({ name: 'titre', title: 'Titre', type: 'string', placeholder: 'Un engagement national.' }),
        defineField({ name: 'titreSuite', title: 'Suite du titre', type: 'string', placeholder: 'Un ancrage' }),
        defineField({ name: 'accent', title: 'Mot accentué (or)', type: 'string', placeholder: 'local.' }),
        defineField({ name: 'description', title: 'Texte de présentation', type: 'text', rows: 3 }),
        defineField({ name: 'carteAlt', title: 'Description accessible de la carte', type: 'string', placeholder: 'Implantations du Cercle d’action légitimiste' }),
        defineField({
          name: 'cercles',
          title: 'Cercles locaux sur la carte de France',
          description: 'Chaque cercle avec coordonnées GPS valides apparaîtra sous forme de blason interactif sur la carte.',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'nom',
                  title: 'Nom du cercle',
                  type: 'string',
                  placeholder: 'CAL Toulouse',
                  validation: rule => rule.required().error('Le nom du cercle est requis.'),
                }),
                defineField({
                  name: 'ville',
                  title: 'Ville ou région',
                  type: 'string',
                  placeholder: 'Toulouse',
                }),
                defineField({
                  name: 'logo',
                  title: 'Blason ou emblème du cercle',
                  type: 'image',
                  description: 'S’affiche dans le marqueur rond sur la carte de France.',
                  options: { hotspot: true },
                }),
                defineField({
                  name: 'latitude',
                  title: 'Latitude GPS (ex: 43.6047)',
                  type: 'number',
                  validation: rule => rule.min(-90).max(90).precision(6),
                }),
                defineField({
                  name: 'longitude',
                  title: 'Longitude GPS (ex: 1.4442)',
                  type: 'number',
                  validation: rule => rule.min(-180).max(180).precision(6),
                }),
                defineField({
                  name: 'description',
                  title: 'Courte description du cercle',
                  type: 'text',
                  rows: 2,
                }),
              ],
              preview: {
                select: {
                  title: 'nom',
                  subtitle: 'ville',
                  media: 'logo',
                  lat: 'latitude',
                  lng: 'longitude',
                },
                prepare({ title, subtitle, media, lat, lng }) {
                  const hasGeo = lat != null && lng != null;
                  const coords = hasGeo ? `📍 ${lat.toFixed(2)}, ${lng.toFixed(2)}` : '⚠️ Sans coordonnées';
                  return {
                    title: title || 'Cercle local',
                    subtitle: subtitle ? `${subtitle} · ${coords}` : coords,
                    media,
                  };
                },
              },
            },
          ],
        }),
      ],
    }),

    // =========================================================================
    // 5. FORMULAIRE DE CONTACT
    // =========================================================================
    defineField({
      name: 'formulaire',
      title: 'Formulaire de contact / adhésion',
      type: 'object',
      group: 'formulaire',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string', placeholder: 'Une rencontre, un premier pas' }),
        defineField({ name: 'titre', title: 'Titre principal', type: 'string', placeholder: 'Rejoindre un CAL.' }),
        defineField({ name: 'description', title: 'Texte d’introduction', type: 'text', rows: 2 }),
        defineField({
          name: 'emailjsServiceId',
          title: 'EmailJS Service ID',
          type: 'string',
          initialValue: 'service_xe1h166',
          placeholder: 'service_xe1h166',
          description: 'Identifiant du service EmailJS (configuré par défaut avec service_xe1h166).',
        }),
        defineField({
          name: 'emailjsTemplateId',
          title: 'EmailJS Template ID',
          type: 'string',
          placeholder: 'template_xxxxxxx',
          description: 'Identifiant du modèle de message configuré dans EmailJS.',
        }),
        defineField({
          name: 'emailjsPublicKey',
          title: 'EmailJS Public Key',
          type: 'string',
          placeholder: 'Clé publique EmailJS (Account > API Keys)',
          description: 'Clé API publique de votre compte EmailJS.',
        }),
        defineField({
          name: 'emailDestinataire',
          title: 'Email de réception de secours (mailto)',
          type: 'string',
          placeholder: 'contact@action-legitimiste.fr',
          description: 'Adresse email de secours utilisée si EmailJS n’est pas configuré.',
          validation: rule => rule.email().error('Veuillez saisir une adresse email valide.'),
        }),
        defineField({ name: 'information', title: 'Texte informatif (bas du formulaire)', type: 'string' }),
        defineField({ name: 'envoyer', title: 'Libellé du bouton d’envoi', type: 'string', placeholder: 'Préparer ma demande' }),
      ],
    }),

    // =========================================================================
    // 6. PIED DE PAGE (FOOTER)
    // =========================================================================
    defineField({
      name: 'footer',
      title: 'Pied de page (Footer)',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre du bandeau final', type: 'string', placeholder: 'Pavons la route du prince jusqu’à Reims' }),
        defineField({ name: 'titre', title: 'Titre final', type: 'string', placeholder: 'Transmettre un héritage.' }),
        defineField({ name: 'titreSuite', title: 'Suite du titre', type: 'string', placeholder: 'La Restauration ne se fera pas sans vous' }),
        defineField({
          name: 'logo',
          title: 'Logo du pied de page',
          type: 'image',
          fields: [defineField({ name: 'alt', title: 'Texte alternatif du logo', type: 'string' })],
        }),
        defineField({
          name: 'soutien',
          title: 'Bouton Soutenir (Bandeau final)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Texte', type: 'string', placeholder: 'Soutenir nos actions' }),
            defineField({ name: 'href', title: 'Lien', type: 'string' }),
          ],
        }),
        defineField({
          name: 'liens',
          title: 'Liens rapides du pied de page',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Libellé', type: 'string', validation: rule => rule.required() }),
                defineField({ name: 'href', title: 'Lien (#section ou URL)', type: 'string', validation: rule => rule.required() }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'href' },
              },
            },
          ],
        }),
        defineField({ name: 'copyright', title: 'Mention de copyright', type: 'string', placeholder: '© 2026 Cercle d’action légitimiste' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'accueil.titre',
      subtitle: 'accueil.surtitre',
      media: 'accueil.image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Page d’Accueil & Contenu du Site',
        subtitle: subtitle || 'Configuration globale du site CAL',
        media,
      };
    },
  },
});
