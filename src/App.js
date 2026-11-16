import { useEffect, useRef, useState } from 'react';
import './App.scss';
import LogoImage from './Image/logo.png';
import FranceMap from './components/FranceMap';
import HeroImage from './Image/hero.jpg';
import { client } from './SanityConnect';
import { defaults, mergeContent, safeHref, siteQuery } from './content/siteContent';
import CalGazette from './CalGazette';
import { fetchOfficialArticles } from './calApi';
import { getInviteSession } from './calApi';
import ActivateAccount from './ActivateAccount';

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
    : 'Aujourd’hui';
}

function ContentLink({ value, className, arrow, onClick }) {
  const href = safeHref(value?.href);
  if (!href) return null;
  const external = /^https?:/i.test(href);
  return <a className={className} href={href} onClick={onClick}
    target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
    {value.label}{arrow && <span aria-hidden="true">{arrow}</span>}
  </a>;
}

function SectionTitle({ content, id }) {
  return <>
    <p className="UpTitle">{content.surtitre}</p>
    <div className="elementTitle">
      <h2 className="title" id={id}>{content.titre}
        {content.titreSuite && <><br />{content.titreSuite} <span>{content.accent}</span></>}
      </h2>
      {content.description && <p>{content.description}</p>}
    </div>
  </>;
}

function PrincipleCard({ item, index }) {
  const title = (item.titre || '').replace(/^\d+\s*[.\-–—/]?\s*/, '');
  const text = (item.texte || '').trim();
  const [introduction, ...points] = text.split(/\s+–\s+/);
  const paragraphs = introduction.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length === 1) {
    const end = introduction.indexOf('. ');
    if (end !== -1) paragraphs.splice(0, 1, introduction.slice(0, end + 1), introduction.slice(end + 2));
  }
  return <article className="secElement">
    <div className="principleHeading">
      <span className="principleNumber" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <h3>{title}</h3>
    </div>
    <div className="principleBody">
      {paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className={paragraphIndex === 0 ? 'principleLead' : undefined}>{paragraph}</p>)}
      {points.length > 0 && <ul>{points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul>}
    </div>
  </article>;
}

function HomePage() {
  const [content, setContent] = useState(defaults);
  const [officialArticles, setOfficialArticles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [carouselState, setCarouselState] = useState({ start: true, end: false });
  const carouselRef = useRef(null);
  const { navigation, accueil, manifeste, journal, territoires, formulaire, footer } = content;

  const circles = territoires.cercles.filter(circle => circle?.nom).map((circle, index) => ({
    ...circle, id: circle._key || `circle-${index}`,
  }));
  const selectedCircle = circles.find(circle => circle.id === selectedCircleId);

  useEffect(() => {
    const controller = new AbortController();
    client.fetch(siteQuery, {}, { signal: controller.signal }).then(data => {
      setContent(mergeContent(defaults, data));
    }).catch(error => {
      if (error.name !== 'AbortError') console.warn('Sanity indisponible : contenu local affiché.');
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOfficialArticles(controller.signal).then(data => {
      setOfficialArticles(Array.isArray(data) ? data : []);
    }).catch(() => {
      // The local journal remains available while the new article type is not deployed.
    });
    return () => controller.abort();
  }, []);

  const carouselArticles = [...officialArticles, ...journal.articles];

  useEffect(() => {
    const carousel = carouselRef.current;
    const update = () => setCarouselState({
      start: carousel.scrollLeft <= 2,
      end: carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2,
    });
    update();
    carousel.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(carousel);
    return () => { observer.disconnect(); carousel.removeEventListener('scroll', update); };
  }, [carouselArticles.length]);

  const scrollCarousel = direction => {
    const carousel = carouselRef.current;
    const article = carousel?.querySelector('article');
    if (!article) return;
    const gap = parseFloat(window.getComputedStyle(carousel).columnGap) || 0;
    carousel.scrollBy({ left: direction * (article.getBoundingClientRect().width + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const sendRequest = event => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.emailDestinataire)) return;
    const data = new FormData(event.currentTarget);
    const body = ['nom', 'prenom', 'email', 'tel', 'cal', 'message']
      .map(key => `${formulaire[key]} : ${(key === 'cal' ? selectedCircle?.nom : data.get(key)) || '—'}`).join('\n\n');
    window.location.href = `mailto:${encodeURIComponent(formulaire.emailDestinataire)}?subject=${encodeURIComponent(formulaire.titre)}&body=${encodeURIComponent(body)}`;
  };
  const canContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.emailDestinataire);

  return <div className="App">
    <a className="skipLink" href="#contenu">Aller au contenu</a>
    <nav aria-label="Navigation principale" onKeyDown={event => {
      if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle').focus(); }
    }}>
      <div className="navElement">
        <div className="nav-left">
          <a href="#acceuil" aria-label="Accueil"><img className="logo" src={navigation.logo?.url || LogoImage} alt={navigation.logo?.alt || navigation.logoAlt} /></a>
          <div className={`navLink ${menuOpen ? 'isOpen' : ''}`} id="navigation-links">
            {navigation.liens.map((link, index) => <ContentLink key={link._key || index} value={link} onClick={() => setMenuOpen(false)} />)}
          </div>
        </div>
        <div className="navActions">
          <ContentLink className="btnAder" value={navigation.adhesion} />
          <ContentLink className="btnAder2" value={navigation.soutien} />
        </div>
        <button id="menu-toggle" className="menuToggle" type="button" aria-controls="navigation-links" aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Fermer' : 'Menu'}</button>
      </div>
    </nav>
    <main id="contenu">
      <section className="Acceuil" id="acceuil" aria-labelledby="accueil-title">
        <div className="section">
          <div className="aside">
            <p className="surtitre">{accueil.surtitre}</p>
            <h1 className="title" id="accueil-title">{accueil.titre}<br />{accueil.titreSuite} <span>{accueil.accent}</span></h1>
            <p className="description">{accueil.description}</p>
            <div className="bouton">
              <ContentLink className="btn btnPlein" value={accueil.principal} arrow="↓" />
              <ContentLink className="btn btnOut" value={accueil.secondaire} arrow="↓" />
            </div>
          </div>
          <img src={accueil.image?.url || HeroImage} alt={accueil.image?.alt || accueil.imageAlt} fetchPriority="high" />
        </div>
      </section>
      <section className="manifest" id="manifest" aria-labelledby="manifest-title">
        <SectionTitle content={manifeste} id="manifest-title" />
        <div className="lient">{manifeste.principes.map((item, index) =>
          <PrincipleCard key={item._key || index} item={item} index={index} />
        )}</div>
      </section>
      <section className="journal" id="journal" aria-labelledby="journal-title">
        <div className="journalHeader">
          <div><SectionTitle content={journal} id="journal-title" /></div>
          <div className="carouselButtons">
            <button type="button" onClick={() => scrollCarousel(-1)} aria-label={journal.precedent} aria-controls="articles" disabled={carouselState.start}>←</button>
            <button type="button" onClick={() => scrollCarousel(1)} aria-label={journal.suivant} aria-controls="articles" disabled={carouselState.end}>→</button>
          </div>
        </div>
        <div className="carouselArticle" id="articles" ref={carouselRef} tabIndex="0" role="region" aria-label={journal.titre}>
          {carouselArticles.map((article, index) => {
            const hasFullContent = Boolean(article.body || article.content);
            const categoryLabel = article.kicker || article.category || article.categorie || 'Gazette';
            const locationPrefix = article.location ? `📍 ${article.location} · ` : '';

            return (
              <article className="articleCard" key={article._key || article._id || index}>
                <div className="articleImage" style={{ position: 'relative' }}>
                  {article.image?.url && <img src={article.image.url} alt={article.image.alt || ''} loading="lazy" />}
                  <span>{locationPrefix}{categoryLabel}</span>
                  {article.readingTime && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.72rem', background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                      ⏱ {article.readingTime} min
                    </span>
                  )}
                </div>
                <div className="articleContent">
                  <div>
                    <h3>{article.title || article.titre}</h3>
                    {article.subtitle && (
                      <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.4rem' }}>
                        {article.subtitle}
                      </p>
                    )}
                    <p>{article.excerpt || article.description || article.body}</p>
                  </div>
                  {hasFullContent ? (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer', padding: 0, textAlign: 'left', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setSelectedArticle(article)}
                    >
                      {journal.lireArticle} <span aria-hidden="true">↓</span>
                    </button>
                  ) : (
                    <ContentLink value={{ label: journal.lireArticle, href: article.href || '/cal' }} arrow="↓" />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="Territoire" id="Territoire" aria-labelledby="territoires-title">
        <SectionTitle content={territoires} id="territoires-title" />
        <div className="elementContent">
          <FranceMap circles={circles} selectedId={selectedCircle?.id || ''} onSelect={setSelectedCircleId} label={territoires.carteAlt} />
          <form className="Formulaire" id="contact" onSubmit={sendRequest} aria-labelledby="form-title" aria-describedby="form-info">
            <p className="surtitre">{formulaire.surtitre}</p>
            <h2 id="form-title">{formulaire.titre}</h2><p>{formulaire.description}</p>
            <div className="form">
              {[['nom', 'prenom'], ['email', 'tel']].map((row, index) => <div className="plat" key={index}>
                {row.map(name => <div key={name}><label htmlFor={name}>{formulaire[name]}</label>
                  <input id={name} name={name} type={name === 'email' ? 'email' : name === 'tel' ? 'tel' : 'text'} required={name !== 'tel'} maxLength={160}
                    autoComplete={{ nom: 'family-name', prenom: 'given-name', email: 'email', tel: 'tel' }[name]} />
                </div>)}
              </div>)}
              <div className="all"><label htmlFor="cal">{formulaire.cal}</label>
                <select id="cal" name="cal" value={selectedCircle?.id || ''} onChange={event => setSelectedCircleId(event.target.value)} required={circles.length > 0}>
                  <option value="" disabled>{formulaire.choix}</option>
                  {circles.map(cercle => <option key={cercle.id} value={cercle.id}>{cercle.nom}{cercle.ville ? ` — ${cercle.ville}` : ''}</option>)}
                </select>
              </div>
              <label htmlFor="message">{formulaire.message}</label><textarea id="message" name="message" rows="5" maxLength={2500} required />
              <p className="formInfo" id="form-info">{canContact ? formulaire.information : formulaire.indisponible}</p>
              <button className="btn btnPlein" type="submit" disabled={!canContact}>{formulaire.envoyer}<span aria-hidden="true">↓</span></button>
            </div>
          </form>
        </div>
      </section>
    </main>

    {/* Modale de lecture complète de l'article sur la Page d'accueil */}
    {selectedArticle && (
      <div
        className="gazetteDialogBackdrop"
        role="presentation"
        onClick={event => { if (event.target === event.currentTarget) setSelectedArticle(null); }}
      >
        <article className="gazetteDialog" role="dialog" aria-modal="true" aria-labelledby="article-title" style={{ maxWidth: '840px', maxHeight: '92vh', overflowY: 'auto' }}>
          <button type="button" className="gazetteDialogClose" aria-label="Fermer" onClick={() => setSelectedArticle(null)}>×</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {selectedArticle.kicker && (
              <span style={{ fontWeight: '800', letterSpacing: '0.08em', color: '#b91c1c', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {selectedArticle.kicker}
              </span>
            )}
            {selectedArticle.location && (
              <span style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                📍 {selectedArticle.location}
              </span>
            )}
            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>· {selectedArticle.category || selectedArticle.categorie || 'Gazette'}</span>
            {selectedArticle.readingTime && (
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>· ⏱ Lecture {selectedArticle.readingTime} min</span>
            )}
          </div>

          <h2 id="article-title" style={{ fontSize: '2.1rem', lineHeight: '1.25', margin: '0 0 0.6rem', fontFamily: 'serif' }}>
            {selectedArticle.title || selectedArticle.titre}
          </h2>

          {selectedArticle.subtitle && (
            <p style={{ fontSize: '1.15rem', lineHeight: '1.45', color: '#475569', fontStyle: 'italic', margin: '0 0 1rem' }}>
              {selectedArticle.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.3rem' }}>
            {selectedArticle.authorAvatar?.url && (
              <img
                src={selectedArticle.authorAvatar.url}
                alt={selectedArticle.authorName || ''}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>
                Par {selectedArticle.authorName || 'La rédaction'}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                {selectedArticle.authorRole ? `${selectedArticle.authorRole} · ` : ''}Publié le {formatDate(selectedArticle.officialPublishedAt || selectedArticle._createdAt)}
              </p>
            </div>
          </div>

          {selectedArticle.image?.url && (
            <figure style={{ margin: '0 0 1.5rem' }}>
              <img
                src={selectedArticle.image.url}
                alt={selectedArticle.image.alt || selectedArticle.title}
                style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '420px' }}
              />
              {(selectedArticle.image.caption || selectedArticle.image.credit) && (
                <figcaption style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span>{selectedArticle.image.caption}</span>
                  {selectedArticle.image.credit && <span>© {selectedArticle.image.credit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {selectedArticle.excerpt && (
            <div style={{ fontSize: '1.18rem', fontWeight: '500', lineHeight: '1.65', color: '#0f172a', paddingLeft: '1.1rem', borderLeft: '4px solid #b91c1c', marginBottom: '1.6rem' }}>
              {selectedArticle.excerpt}
            </div>
          )}

          {selectedArticle.factbox && (selectedArticle.factbox.title || (Array.isArray(selectedArticle.factbox.items) && selectedArticle.factbox.items.length > 0)) && (
            <aside style={{ margin: '1.5rem 0', padding: '1.2rem 1.4rem', background: '#f8fafc', borderTop: '3px solid #0284c7', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.6rem', color: '#0369a1', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📌 {selectedArticle.factbox.title || 'Repères'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.7', color: '#334155' }}>
                {(selectedArticle.factbox.items || []).map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                ))}
              </ul>
            </aside>
          )}

          {selectedArticle.quote?.text && (
            <blockquote style={{ margin: '1.8rem 0', padding: '1.2rem 1.6rem', background: '#f8fafc', borderLeft: '4px solid #0f172a', borderRadius: '4px', fontStyle: 'italic', fontSize: '1.15rem' }}>
              « {selectedArticle.quote.text} »
              {selectedArticle.quote.author && (
                <cite style={{ display: 'block', fontSize: '0.88rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'normal' }}>
                  — {selectedArticle.quote.author}
                </cite>
              )}
            </blockquote>
          )}

          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.9', fontSize: '1.08rem', color: '#334155' }}>
            {selectedArticle.body || selectedArticle.description}
          </div>

          {Array.isArray(selectedArticle.gallery) && selectedArticle.gallery.length > 0 && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>📸 En images</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {selectedArticle.gallery.map((img, idx) => (
                  <figure key={idx} style={{ margin: 0 }}>
                    <img src={img.url} alt={img.alt || `Photo ${idx + 1}`} style={{ width: '100%', borderRadius: '6px', height: '180px', objectFit: 'cover' }} />
                    {img.caption && <figcaption style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(selectedArticle.tags) && selectedArticle.tags.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Mots-clés :</span>
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#334155' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    )}

    <footer>
      <div className="hero">
        <p>{footer.surtitre}</p><h2 className="title">{footer.titre}<br />{footer.titreSuite}</h2>
        <ContentLink className="btn" value={footer.soutien} arrow="↓" />
      </div>
      <div className="footer-bottom">
        <div className="footer-left"><img src={footer.logo?.url || navigation.logo?.url || LogoImage} alt={footer.logo?.alt || footer.logoAlt} loading="lazy" /><p>{footer.copyright}</p></div>
        <div className="footer-right">{footer.liens.map((link, index) => <ContentLink key={link._key || index} value={link} arrow={link.href === '#acceuil' ? '↑' : '↓'} />)}</div>
      </div>
    </footer>
  </div>;
}

function App() {
  const invitation = getInviteSession();
  if (window.location.pathname === '/activer-compte') return <ActivateAccount />;
  if (window.location.pathname === '/cal' && invitation) {
    window.history.replaceState({}, document.title, `/activer-compte${window.location.hash}`);
    return <ActivateAccount />;
  }
  return window.location.pathname === '/cal' ? <CalGazette /> : <HomePage />;
}

export default App;
