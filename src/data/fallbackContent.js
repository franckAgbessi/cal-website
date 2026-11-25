import heroImage from '../Image/hero.jpg';
import featureImage from '../Image/hero1.png';

export const fallbackSite = {
  siteName: 'Cercle d’Action Légitimiste de Toulouse',
  shortName: 'Occitan Royaliste',
  description: 'Un cercle d’étude et de transmission au cœur de Toulouse.',
  email: 'contact@occitan-royaliste.fr',
};

export const fallbackHome = {
  heroTitle: 'L’héritage de la France, l’âme de Toulouse.',
  heroSubtitle: 'HISTOIRE · TRADITION · TRANSMISSION',
  heroDescription: 'Le Cercle d’Action Légitimiste de Toulouse œuvre à la connaissance, à la transmission et au rayonnement de l’histoire monarchique française, de ses traditions et de son patrimoine.',
  heroImage: heroImage,
  heroPrimaryCTA: { label: 'Découvrir notre cercle', href: '/#le-cercle' },
  heroSecondaryCTA: { label: 'Lire nos publications', href: '/actualites' },
  introductionTitle: 'Étudier, transmettre, faire vivre.',
  introductionText: 'Le Cercle est un lieu de rencontre et de réflexion ouvert à celles et ceux qui souhaitent approfondir l’histoire de France, la mémoire monarchique et le patrimoine toulousain. Nos activités privilégient l’étude, l’échange et la transmission.',
  introductionImage: featureImage,
  featuredArticlesTitle: 'À la une',
  featuredArticlesDescription: 'Regards sur notre histoire et notre héritage.',
  historySection: [
    { title: 'Les comtes de Toulouse', text: 'Relire l’histoire d’une capitale méridionale dont la mémoire façonne encore la ville.', href: '/histoire' },
    { title: 'La monarchie française', text: 'Explorer les institutions, les dynasties et les continuités qui ont construit la France.', href: '/histoire' },
    { title: 'Patrimoine chrétien et occitan', text: 'Découvrir des lieux, des œuvres et des traditions qui relient culture et territoire.', href: '/histoire' },
  ],
  historicalQuote: 'Le passé éclaire le présent lorsque nous consentons à le regarder avec attention.',
  historicalQuoteAuthor: 'Texte de présentation — à remplacer par une citation sourcée dans Sanity',
  joinSection: { title: 'Faire vivre notre héritage', text: 'Vous souhaitez participer à nos travaux, recevoir nos informations ou prendre part à une rencontre ? Écrivez-nous.', label: 'Nous contacter', href: '/contact' },
};

