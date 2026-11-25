import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import useSanityQuery from '../hooks/useSanityQuery';
import { aboutPageQuery, contactPageQuery, historyPageQuery } from '../sanity/queries';
import { setPageMeta } from '../lib/seo';
import heritage from '../Image/hero1.png';

const content = {
  about: { eyebrow: 'LE CERCLE', title: 'Une maison d’étude, de mémoire et de dialogue.', lead: 'Le Cercle d’Action Légitimiste de Toulouse rassemble celles et ceux qui souhaitent approfondir l’histoire de France et le patrimoine toulousain dans un esprit de rigueur et de transmission.', sections: [{ title: 'Notre vocation', text: 'Favoriser une connaissance attentive de l’histoire monarchique française, de ses institutions et de son héritage culturel.' }, { title: 'Nos rencontres', text: 'Lectures, conférences, visites et échanges offrent des occasions concrètes de travailler ensemble et de partager les sources.' }, { title: 'Notre méthode', text: 'L’étude des textes, des lieux et des œuvres : une démarche ouverte, exigeante et respectueuse des faits.' }] },
  history: { eyebrow: 'HISTOIRE & PATRIMOINE', title: 'Des héritages à connaître, des lieux à regarder autrement.', lead: 'De la mémoire des comtes de Toulouse à l’histoire longue de la monarchie française, cette page ouvre des pistes de lecture à enrichir dans le Studio.', sections: [{ title: 'Toulouse, une mémoire singulière', text: 'La ville rose conserve des traces multiples de son passé politique, religieux et artistique. Ce territoire est le point de départ d’une attention au patrimoine local.' }, { title: 'La continuité française', text: 'L’histoire de la monarchie ne se résume pas aux figures les plus célèbres : elle invite à considérer la durée, les institutions et la construction d’une culture politique.' }, { title: 'Sources et transmission', text: 'Chaque dossier historique doit s’appuyer sur des références identifiées. Les bibliographies et sources seront publiées avec les articles concernés.' }] },
};
function EditorialPage({ type }) {
  const query = type === 'about' ? aboutPageQuery : historyPageQuery;
  const result = useSanityQuery(query, {}, null);
  const fallback = content[type];
  const data = result.data || fallback;
  const sections = data.sections?.length ? data.sections : fallback.sections;
  useEffect(() => setPageMeta({ title: data.title || fallback.title, description: data.introduction || fallback.lead }), [data, fallback]);
  return <main className="page"><header className="page-hero shell"><p className="eyebrow">{data.eyebrow || fallback.eyebrow}</p><h1>{data.title || fallback.title}</h1><p>{data.introduction || fallback.lead}</p></header><section className="shell editorial-image"><img src={data.images?.[0]?.asset?.url || data.illustrations?.[0]?.asset?.url || heritage} alt="Architecture et patrimoine toulousains" /></section><section className="section shell editorial-sections">{sections.map((section, index) => <article key={section._key || index}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.text || section.content}</p></div></article>)}</section><section className="join"><div className="shell join__inner"><div><p className="eyebrow">ÉCHANGER</p><h2>Une question, une suggestion ?</h2><p>Le Cercle reçoit volontiers les messages relatifs à ses activités et à ses publications.</p></div><Button to="/contact" variant="light">Nous écrire</Button></div></section></main>;
}
export function About() { return <EditorialPage type="about" />; }
export function History() { return <EditorialPage type="history" />; }

export function Contact() {
  const result = useSanityQuery(contactPageQuery, {}, null);
  const data = result.data || {};
  const title = data.title || 'Entrer en relation avec le Cercle.';
  const description = data.description || 'Pour une information sur nos activités, une proposition de rencontre ou une question sur nos publications, vous pouvez nous écrire.';
  useEffect(() => setPageMeta({ title: 'Contact', description }), [description]);
  return <main className="page"><header className="page-hero shell"><p className="eyebrow">CONTACT</p><h1>{title}</h1><p>{description}</p></header><section className="shell contact-grid"><div className="contact-card"><Mail size={24} /><h2>Nous écrire</h2><p>La voie la plus simple pour recevoir une réponse du Cercle.</p><a href={`mailto:${data.contactInformation?.email || 'contact@occitan-royaliste.fr'}`}>{data.contactInformation?.email || 'contact@occitan-royaliste.fr'}</a></div><div className="contact-card"><MapPin size={24} /><h2>Toulouse</h2><p>Les informations de rencontre et les modalités pratiques sont communiquées par le Cercle.</p><Link className="text-link" to="/actualites">Consulter les publications</Link></div></section><section className="shell form-section"><SectionHeading eyebrow="ÉCRIRE AU CERCLE" title="Votre message" /><form className="contact-form" onSubmit={(event) => { event.preventDefault(); const dataForm = new FormData(event.currentTarget); window.location.href = `mailto:contact@occitan-royaliste.fr?subject=${encodeURIComponent(dataForm.get('subject'))}&body=${encodeURIComponent(`${dataForm.get('message')}\n\nNom : ${dataForm.get('name')}\nE-mail : ${dataForm.get('email')}`)}`; }}><label>Nom<input name="name" required autoComplete="name" /></label><label>E-mail<input name="email" type="email" required autoComplete="email" /></label><label>Objet<input name="subject" required /></label><label>Message<textarea name="message" rows="6" required /></label><Button type="submit">Préparer mon message</Button></form></section></main>;
}

export function Legal() { useEffect(() => setPageMeta({ title: 'Mentions légales', description: 'Informations légales du Cercle d’Action Légitimiste de Toulouse.' }), []); return <main className="page shell legal"><p className="eyebrow">INFORMATIONS</p><h1>Mentions légales</h1><p className="legal-note">Les mentions légales définitives doivent être renseignées par le responsable de la publication avant la mise en ligne.</p><h2>Éditeur du site</h2><p>Cercle d’Action Légitimiste de Toulouse. Coordonnées et responsable de publication à compléter dans les paramètres du site.</p><h2>Propriété intellectuelle</h2><p>Les contenus, images et textes publiés sont protégés selon les droits applicables. Toute réutilisation nécessite l’autorisation de leurs ayants droit.</p><h2>Données personnelles</h2><p>Ce site ne collecte aucune donnée via un formulaire de traitement automatisé. Les messages préparés depuis la page contact sont envoyés par le logiciel de messagerie de l’utilisateur.</p></main>; }
