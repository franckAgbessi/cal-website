import { useEffect, useState } from 'react';
import './App.scss';
import heroImage from './Image/hero1.png';
import logoImage from './Image/logo.png';
import { client, homeQuery, articleListQuery, articleBySlugQuery } from './SanityConnect';

const defaultContent = {
  hero: {
    eyebrow: 'Cercle d’Action Légitimiste de Toulouse',
    title: 'Occitan Royaliste',
    text: 'Faire vivre l’histoire, transmettre notre héritage et cultiver la mémoire du royaume de France.',
  },
  presentation: {
    title: 'Un héritage, une histoire, une transmission.',
    text: 'Le Cercle d’Action Légitimiste de Toulouse est un lieu de rencontre, d’étude et de transmission. Nous réunissons celles et ceux qui souhaitent mieux connaître l’histoire de France et le patrimoine occitan.',
  },
  missions: {
    visible: true,
    title: 'Nos engagements',
    description: 'Étudier, partager et transmettre une mémoire vivante.',
  },
  actualites: { visible: true, title: 'Dernières publications', description: 'Chroniques et études du cercle.' },
  evenements: { visible: true, title: 'Les prochains événements', description: 'Conférences, rencontres et visites autour de l’histoire et du patrimoine.' },
  appel: { visible: true, title: 'Rejoindre le cercle', text: 'Vous souhaitez participer à nos travaux, nos rencontres ou simplement en savoir davantage ? Écrivez-nous.' },
  history: [
    { number: '01', title: 'La monarchie française', text: 'Comprendre la continuité historique de la monarchie et la place qu’elle occupe dans la mémoire nationale.' },
    { number: '02', title: 'Les Capétiens', text: 'Une dynastie, un royaume : parcourir les siècles qui ont façonné la France.' },
    { number: '03', title: 'Toulouse et l’Occitanie', text: 'Redécouvrir les villes, les lignées et les monuments qui composent notre héritage méridional.' },
  ],
};

const articles = [
  { category: 'Démonstration', title: 'Les publications du cercle', date: 'Contenu de démonstration', text: 'Les articles publiés depuis Sanity apparaîtront automatiquement dans cette rubrique.' },
];

function formatDate(value) {
  if (!value) return 'Date à venir';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));
}

function portableTextToString(value) {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  return value.flatMap(block => block.children || []).map(child => child.text || '').join(' ');
}

function ArticlePage({ article, loading, onBack }) {
  if (loading) return <main className="article-loading"><p className="eyebrow dark">Occitan Royaliste</p><h1>Chargement de l’article…</h1></main>;
  if (!article) return <main className="not-found"><p className="eyebrow dark">404</p><h1>Article introuvable.</h1><a className="text-link" href="/actualites">Retour aux actualités <span>↗</span></a></main>;
  return <main className="article-page">
    <div className="article-page-inner"><a className="text-link" href="/actualites" onClick={onBack}>← Toutes les actualités</a>
      <p className="eyebrow dark article-page-category">{article.category?.title || 'Actualités'}</p><h1>{article.title}</h1>
      {article.subtitle && <p className="article-page-subtitle">{article.subtitle}</p>}
      <p className="article-byline">Par {article.author?.name || 'La rédaction'} · {formatDate(article.publishedAt)} · {article.readingTime || '—'} min de lecture</p>
      {article.coverUrl && <figure><img src={article.coverUrl} alt={article.caption || article.title} /><figcaption>{article.caption}{article.credit && ` — ${article.credit}`}</figcaption></figure>}
      <div className="article-body">{(article.body || []).map((block, index) => {
        if (!block.children) return null;
        const text = block.children.map(child => child.text).join('');
        if (block.style === 'h2') return <h2 key={block._key || index}>{text}</h2>;
        if (block.style === 'h3') return <h3 key={block._key || index}>{text}</h3>;
        if (block.style === 'h4') return <h4 key={block._key || index}>{text}</h4>;
        if (block.style === 'blockquote') return <blockquote key={block._key || index}>{text}</blockquote>;
        return <p key={block._key || index}>{text}</p>;
      })}</div>
    </div>
  </main>;
}

function App() {
  const [content, setContent] = useState(defaultContent);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!client) return undefined;
    client.fetch(homeQuery).then((data) => {
      if (!data) return;
      setContent((current) => ({
        ...current,
        hero: {
          ...current.hero,
          ...(data.hero || {}),
          text: data.hero?.description || data.hero?.text || current.hero.text,
        },
        presentation: {
          ...current.presentation,
          ...(data.presentation || {}),
          text: portableTextToString(data.presentation?.description) || data.presentation?.text || current.presentation.text,
        },
        missions: { ...current.missions, ...(data.missions || {}) },
        actualites: { ...current.actualites, ...(data.actualites || {}) },
        evenements: { ...current.evenements, ...(data.evenements || {}) },
        appel: { ...current.appel, ...(data.appel || {}) },
        history: Array.isArray(data.history) && data.history.length ? data.history : current.history,
      }));
    }).catch(() => {
      // The editorial fallback keeps the public page available when Sanity is not configured.
    });
    return undefined;
  }, []);

  useEffect(() => {
    if (!client) return undefined;
    const path = window.location.pathname;
    client.fetch(articleListQuery).then(data => setPublishedArticles(Array.isArray(data) ? data : [])).catch(() => {});
    if (path.startsWith('/actualites/')) {
      setArticleLoading(true);
      client.fetch(articleBySlugQuery, { slug: decodeURIComponent(path.split('/').pop()) })
        .then((article) => {
          setCurrentArticle(article || null);
          if (article?.title) {
            document.title = `${article.title} | Occitan Royaliste`;
          }
        })
        .catch(() => setCurrentArticle(null))
        .finally(() => setArticleLoading(false));
    }
    return undefined;
  }, []);

  const closeMenu = () => setMenuOpen(false);

  if (window.location.pathname.startsWith('/actualites/')) {
    return (
      <>
        <header className="site-header article-header">
          <a className="brand" href="/" aria-label="Occitan Royaliste, accueil"><img src={logoImage} alt="" /><span><strong>Occitan</strong><em>Royaliste</em></span></a>
          <nav aria-label="Navigation principale">
            <a href="/#cercle">Le cercle</a>
            <a href="/#histoire">Histoire</a>
            <a href="/actualites">Actualités</a>
            <a href="/#evenements">Événements</a>
            <a className="nav-contact" href="/#contact">Contact <span>↗</span></a>
          </nav>
        </header>
        <ArticlePage article={currentArticle} loading={articleLoading} />
        <footer className="site-footer">
          <div className="footer-main">
            <a className="brand footer-brand" href="/"><img src={logoImage} alt="" /><span><strong>Occitan</strong><em>Royaliste</em></span></a>
            <p>Un cercle d’étude et de transmission<br />au cœur de Toulouse.</p>
            <div className="footer-nav"><a href="/#cercle">Le cercle</a><a href="/#histoire">Histoire</a><a href="/actualites">Publications</a><a href="/#contact">Contact</a></div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Occitan Royaliste</span><span>Histoire · Culture · Transmission</span><a href="#contenu">Retour en haut ↑</a></div>
        </footer>
      </>
    );
  }

  if (window.location.pathname === '/actualites' || window.location.pathname === '/actualites/') {
    return (
      <>
        <header className="site-header article-header">
          <a className="brand" href="/"><img src={logoImage} alt="" /><span><strong>Occitan</strong><em>Royaliste</em></span></a>
          <nav aria-label="Navigation principale"><a href="/#cercle">Le cercle</a><a href="/#histoire">Histoire</a><a href="/actualites">Actualités</a><a href="/#evenements">Événements</a><a className="nav-contact" href="/#contact">Contact <span>↗</span></a></nav>
        </header>
        <main className="listing-page">
          <p className="eyebrow dark">La revue</p>
          <h1>Actualités<br /><em>et chroniques.</em></h1>
          <div className="listing-grid">
            {publishedArticles.map((item, index) => (
              <article key={item._id}>
                <a href={`/actualites/${item.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Lire ${item.title} dans un nouvel onglet`}>
                  <div className="article-image">{item.coverUrl && <img src={item.coverUrl} alt="" />}<span>{String(index + 1).padStart(2, '0')}</span></div>
                </a>
                <p className="article-meta">{item.category?.title || 'Actualités'} <i /> {formatDate(item.publishedAt)}</p>
                <h2><a href={`/actualites/${item.slug}`} target="_blank" rel="noopener noreferrer">{item.title}</a></h2>
                <p>{item.summary || item.subtitle}</p>
                <a className="text-link" href={`/actualites/${item.slug}`} target="_blank" rel="noopener noreferrer">Lire l’article <span>↗</span></a>
              </article>
            ))}
          </div>
          {publishedArticles.length === 0 && <p className="empty-state">Aucun article publié pour le moment.</p>}
        </main>
      </>
    );
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="site-header">
        <a className="brand" href="#accueil" onClick={closeMenu} aria-label="Occitan Royaliste, accueil">
          <img src={logoImage} alt="" />
          <span><strong>Occitan</strong><em>Royaliste</em></span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>
          <span>{menuOpen ? 'Fermer' : 'Menu'}</span><i aria-hidden="true" />
        </button>
        <nav id="main-nav" className={menuOpen ? 'is-open' : ''} aria-label="Navigation principale">
          <a href="#cercle" onClick={closeMenu}>Le cercle</a>
          <a href="#histoire" onClick={closeMenu}>Histoire</a>
          <a href="#actualites" onClick={closeMenu}>Actualités</a>
          <a href="#evenements" onClick={closeMenu}>Événements</a>
          <a className="nav-contact" href="#contact" onClick={closeMenu}>Contact <span>↗</span></a>
        </nav>
      </header>

      <main id="contenu">
        {content.hero.visible !== false && <section className="hero" id="accueil">
          <img className="hero-image" src={content.hero.imageUrl || heroImage} alt="Architecture classique française" />
          <div className="hero-overlay" style={{ opacity: (content.hero.overlay ?? 35) / 100 }} />
          <div className="hero-content">
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-lead">{content.hero.text}</p>
            <div className="hero-actions">
              <a className="button button-gold" href={content.hero.primaryButton?.href || '#cercle'}>{content.hero.primaryButton?.label || 'Découvrir le cercle'} <span>→</span></a>
              <a className="text-link light" href={content.hero.secondaryButton?.href || '#actualites'}>{content.hero.secondaryButton?.label || 'Nos publications'} <span>↗</span></a>
            </div>
          </div>
          <div className="hero-caption">Depuis Toulouse<br />Histoire · Culture · Transmission</div>
          <a className="scroll-cue" href="#cercle" aria-label="Découvrir la suite">Défiler <span>↓</span></a>
        </section>}

        {content.presentation.visible !== false && <section className="intro section-wrap" id="cercle">
          <div className="section-index">01 <span>Le cercle</span></div>
          <div className="intro-grid">
            <div>
              <p className="eyebrow dark">Notre vocation</p>
              <h2>{content.presentation.title}</h2>
            </div>
            <div className="intro-copy">
              <p>{content.presentation.text}</p>
              <a className="text-link" href="#adhesion">En savoir plus <span>↗</span></a>
            </div>
          </div>
          <div className="rule" />
          <div className="values">
            {(content.missions.items?.length ? content.missions.items : [
              { title: 'Étudier', description: 'Approfondir l’histoire de France avec exigence et curiosité.' },
              { title: 'Partager', description: 'Faire de la culture un lien vivant entre les générations.' },
              { title: 'Transmettre', description: 'Protéger une mémoire et la confier à l’avenir.' },
            ]).map((item, index) => (
              <div key={item._key || item.title || index}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>}

        <section className="history section-wrap navy-section" id="histoire">
          <div className="section-index gold-index">02 <span>Repères historiques</span></div>
          <div className="history-heading"><p className="eyebrow">Une histoire à connaître</p><h2>Les racines d’une<br /><em>nation.</em></h2></div>
          <div className="history-list">
            {content.history.map((item, index) => (
              <article className="history-item" key={item.number || index}>
                <span className="history-number">{item.number || `0${index + 1}`}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p><a href="#actualites" aria-label={`Lire ${item.title}`}>Lire le dossier <span>↗</span></a></div>
              </article>
            ))}
          </div>
        </section>

        {content.actualites.visible !== false && <section className="journal section-wrap" id="actualites">
          <div className="section-index">03 <span>La revue</span></div>
          <div className="journal-heading"><div><p className="eyebrow dark">{content.actualites.description || 'Chroniques & études'}</p><h2>{content.actualites.title || 'Dernières publications'}</h2></div><a className="text-link" href="/actualites">Voir toutes les publications <span>↗</span></a></div>
          <div className="article-grid">
            {(publishedArticles.length ? publishedArticles : articles).slice(0, 3).map((article, index) => (
              <article className={`article-card article-${index + 1}`} key={article.title}>
                <div className="article-image">{article.coverUrl && <img src={article.coverUrl} alt="" />}<span>{String(index + 1).padStart(2, '0')}</span></div>
                <p className="article-meta">{article.category?.title || article.category} <i /> {article.date || formatDate(article.publishedAt)}</p>
                <h3>{article.title}</h3>
                <p>{article.summary || article.subtitle || article.text}</p>
                {article.slug
                  ? <a href={`/actualites/${article.slug}`} target="_blank" rel="noopener noreferrer">Lire l’article <span>↗</span></a>
                  : <span className="demo-article-label">Contenu de démonstration</span>}
              </article>
            ))}
          </div>
        </section>}


        {content.appel.visible !== false && <section className="join" id="adhesion">
          <div className="join-inner"><p className="eyebrow">Une histoire vivante</p><h2>{content.appel.title || 'Rejoindre le cercle'}</h2><p>{content.appel.text || 'Vous souhaitez participer à nos travaux, nos rencontres ou simplement en savoir davantage ? Écrivez-nous.'}</p><a className="button button-gold" href="#contact">Prendre contact <span>→</span></a></div>
          <div className="join-mark">✦</div>
        </section>}

        <section className="contact section-wrap" id="contact">
          <div className="section-index">04 <span>Correspondance</span></div>
          <div className="contact-grid"><div><p className="eyebrow dark">Nous écrire</p><h2>Entrons en<br /><em>conversation.</em></h2></div><div className="contact-copy"><p>Pour toute question sur le cercle, nos activités ou l’adhésion, adressez-nous un message.</p><a className="email-link" href="mailto:cercleactionlegitimiste-toulouse.fr">cercleactionlegitimiste-toulouse.fr <span>↗</span></a></div></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><a className="brand footer-brand" href="#accueil"><img src={logoImage} alt="" /><span><strong>Occitan</strong><em>Royaliste</em></span></a><p>Un cercle d’étude et de transmission<br />au cœur de Toulouse.</p><div className="footer-nav"><a href="#cercle">Le cercle</a><a href="#histoire">Histoire</a><a href="#actualites">Publications</a><a href="#contact">Contact</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Occitan Royaliste</span><span>Histoire · Culture · Transmission</span><a href="#accueil">Retour en haut ↑</a></div>
      </footer>
    </div>
  );
}

export default App;
