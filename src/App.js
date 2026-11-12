import { useEffect, useRef, useState } from 'react';
import './App.scss';
import LogoImage from './Image/logo.png';
import FranceMap from './components/FranceMap';
import HeroImage from './Image/hero.jpg';
import { client } from './SanityConnect';
import { defaults, mergeContent, safeHref, siteQuery } from './content/siteContent';
import CalGazette from './CalGazette';
import { fetchOfficialArticles } from './calApi';

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
  // Give legacy single-paragraph CMS content the same readable hierarchy.
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
          {carouselArticles.map((article, index) => <article className="articleCard" key={article._key || index}>
            <div className="articleImage">
              {article.image?.url && <img src={article.image.url} alt={article.image.alt || ''} loading="lazy" />}
              <span>{article.categorie}</span>
            </div>
            <div className="articleContent">
              <div><h3>{article.titre}</h3><p>{article.description}</p></div>
              <ContentLink value={{ label: journal.lireArticle, href: article.href }} arrow="↓" />
            </div>
          </article>)}
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
  return window.location.pathname === '/cal' ? <CalGazette /> : <HomePage />;
}

export default App;
