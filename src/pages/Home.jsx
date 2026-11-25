import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Landmark, Mail, MapPin, ScrollText } from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import ArticleCard from '../components/articles/ArticleCard';
import useSanityQuery from '../hooks/useSanityQuery';
import { aboutPageQuery, contactPageQuery, historyPageQuery, homePageQuery, latestArticlesQuery } from '../sanity/queries';
import { fallbackHome } from '../data/fallbackContent';
import { portableTextToString } from '../lib/format';
import { setPageMeta } from '../lib/seo';

const icons = [Landmark, ScrollText, BookOpen];
const landingContent = {
  about: [
    { title: 'Un lieu de transmission', text: 'Le Cercle réunit celles et ceux qui souhaitent approfondir l’histoire de France, la mémoire monarchique et le patrimoine de Toulouse.' },
    { title: 'Une pratique partagée', text: 'Lectures, conférences, visites et échanges donnent à cette recherche un cadre concret, au fil des saisons.' },
  ],
  history: [
    { title: 'Toulouse, une mémoire singulière', text: 'La ville conserve les traces croisées de son histoire politique, religieuse et artistique. C’est un point de départ pour regarder le patrimoine local avec précision.' },
    { title: 'La continuité française', text: 'Les institutions, les dynasties et les œuvres offrent une histoire longue à étudier sans réduire sa complexité.' },
    { title: 'Sources et transmission', text: 'Chaque dossier appelle des références identifiées. Les articles peuvent faire apparaître bibliographie et sources depuis le Studio.' },
  ],
};
function normalizeHome(data) {
  if (!data) return fallbackHome;
  return { ...fallbackHome, ...data, heroTitle: data.heroTitle || data.hero?.title || fallbackHome.heroTitle, heroSubtitle: data.heroSubtitle || data.hero?.eyebrow || fallbackHome.heroSubtitle, heroDescription: data.heroDescription || data.hero?.description || fallbackHome.heroDescription, heroImage: data.heroImageUrl || data.hero?.imageUrl || fallbackHome.heroImage, heroPrimaryCTA: data.heroPrimaryCTA || data.hero?.primaryButton || { label: 'Découvrir notre cercle', href: '/#le-cercle' }, heroSecondaryCTA: data.heroSecondaryCTA || data.hero?.secondaryButton || { label: 'Lire nos publications', href: '/actualites' }, introductionTitle: data.introductionTitle || data.presentation?.title || fallbackHome.introductionTitle, introductionText: data.introductionText || portableTextToString(data.presentation?.description) || fallbackHome.introductionText, introductionImage: data.introductionImageUrl || data.presentation?.imageUrl || fallbackHome.introductionImage, featuredArticlesTitle: data.featuredArticlesTitle || data.actualites?.title || fallbackHome.featuredArticlesTitle, featuredArticlesDescription: data.featuredArticlesDescription || data.actualites?.description || fallbackHome.featuredArticlesDescription, historicalQuote: data.historicalQuote || data.quote?.quote || fallbackHome.historicalQuote, historicalQuoteAuthor: data.historicalQuoteAuthor || data.quote?.author || fallbackHome.historicalQuoteAuthor, joinSection: data.joinSection || data.appel || fallbackHome.joinSection };
}
export default function Home() {
  const home = useSanityQuery(homePageQuery, {}, null);
  const articles = useSanityQuery(latestArticlesQuery, {}, []);
  const about = useSanityQuery(aboutPageQuery, {}, null);
  const history = useSanityQuery(historyPageQuery, {}, null);
  const contact = useSanityQuery(contactPageQuery, {}, null);
  const content = useMemo(() => normalizeHome(home.data), [home.data]);
  const publications = articles.data || [];
  useEffect(() => setPageMeta({ description: content.heroDescription }), [content.heroDescription]);
  return <>
    <section className="hero" style={{ '--hero-image': `url(${content.heroImage})` }}><div className="shell hero__inner"><p className="eyebrow">{content.heroSubtitle}</p><h1>{content.heroTitle}</h1><p className="hero__lede">{content.heroDescription}</p><div className="hero__actions"><Button href={content.heroPrimaryCTA.href}>{content.heroPrimaryCTA.label}</Button><Button href={content.heroSecondaryCTA.href} variant="light">{content.heroSecondaryCTA.label}</Button></div></div><span className="hero__rule" /></section>
    <section className="section intro" id="le-cercle"><div className="shell split"><div><SectionHeading eyebrow="LE CERCLE" title={about.data?.title || content.introductionTitle} /><p className="prose-lede">{about.data?.introduction || content.introductionText}</p><div className="introduction-notes">{(about.data?.sections?.length ? about.data.sections : landingContent.about).map((item) => <article key={item._key || item.title}><h3>{item.title}</h3><p>{item.text || portableTextToString(item.content)}</p></article>)}</div></div><div className="intro__visual"><img className="intro__image" src={content.introductionImage} alt="Vue patrimoniale de Toulouse" loading="lazy" /><p>Le Cercle d’Action Légitimiste de Toulouse<br />— Occitan Royaliste</p></div></div></section>
    <section className="section history-landing" id="histoire"><div className="shell"><div className="history-landing__head"><SectionHeading eyebrow="HISTOIRE & PATRIMOINE" title={history.data?.title || 'Des héritages à connaître, des lieux à regarder autrement.'} description={history.data?.introduction || 'De Toulouse à l’histoire longue de la France, quelques chemins de lecture pour situer notre démarche.'} /><p className="history-landing__aside">Les contenus ci-dessous sont éditables dans Sanity, avec leurs illustrations et leurs références.</p></div><div className="history-stories">{(history.data?.sections?.length ? history.data.sections : landingContent.history).map((item, index) => { const Icon = icons[index % icons.length]; return <article key={item._key || item.title}><span>{String(index + 1).padStart(2, '0')}</span><Icon aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.text || portableTextToString(item.content)}</p></div></article>; })}</div></div></section>
    <section className="section publications-preview"><div className="shell"><div className="publications-preview__head"><SectionHeading eyebrow="LA REVUE" title={content.featuredArticlesTitle} description={content.featuredArticlesDescription} /><Link className="text-link" to="/actualites">Ouvrir toutes les actualités <ArrowRight size={17} /></Link></div>{publications.length ? <div className="home-publications">{publications.slice(0, 4).map((article, index) => <ArticleCard key={article._id} article={article} featured={index === 0} />)}</div> : <div className="empty-state empty-state--compact"><h3>La revue se prépare.</h3><p>Les articles publiés dans Sanity apparaîtront ici automatiquement.</p></div>}</div></section>
    <section className="quote"><div className="quote__inner"><p>« {content.historicalQuote} »</p><cite>{content.historicalQuoteAuthor}</cite></div></section>
    <section className="contact-landing" id="contact"><div className="shell contact-landing__inner"><div><p className="eyebrow">PRENDRE CONTACT</p><h2>{content.joinSection.title}</h2><p>{contact.data?.description || content.joinSection.text}</p></div><div className="contact-landing__details"><a href={`mailto:${contact.data?.contactInformation?.email || 'contact@occitan-royaliste.fr'}`}><Mail size={18} />{contact.data?.contactInformation?.email || 'contact@occitan-royaliste.fr'}</a><p><MapPin size={18} />Toulouse</p><span>Pour les rencontres, les publications et la vie du Cercle.</span></div></div></section>
  </>;
}
