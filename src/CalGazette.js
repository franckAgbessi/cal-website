import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMemberArticles, fetchOfficialArticles, getSession, signIn, signOut, signUp } from './calApi';

const categories = [
  'Toutes',
  'Enquête & Reportage',
  'Idées & Débats',
  'Vie locale',
  'Initiative',
  'Portrait',
  'Culture',
  'Tribune',
  'Agenda & Rencontres',
];

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
    : 'Aujourd’hui';
}

function ArticleCard({ article, featured = false, onOpen }) {
  const isBoth = article.publicationStatus === 'both';
  const isMain = article.publicationStatus === 'main' || article.publicationStatus === 'official';
  const statusLabel = isBoth
    ? '🌟 Gazette & Site principal'
    : isMain
      ? '🌐 Site principal'
      : '🔒 Gazette membres';

  return <article className={`gazetteArticle ${featured || article.isFeatured ? 'gazetteArticleFeatured' : ''}`}>
    {article.image?.url && (
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={article.image.url} alt={article.image.alt || article.title} />
        {article.image.credit && (
          <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '0.65rem', background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
            © {article.image.credit}
          </span>
        )}
        {article.location && (
          <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.72rem', background: '#0f172a', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
            📍 {article.location}
          </span>
        )}
      </div>
    )}
    <div className="gazetteArticleBody">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <p className="gazetteKicker">
          {article.kicker ? <strong>{article.kicker.toUpperCase()} · </strong> : null}
          {article.category || 'Gazette'} · {formatDate(article.officialPublishedAt || article._createdAt)}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {article.readingTime && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>⏱ {article.readingTime} min</span>
          )}
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', background: '#eef2ff', borderRadius: '4px', fontWeight: '500' }}>
            {statusLabel}
          </span>
        </div>
      </div>
      <h3><button type="button" onClick={() => onOpen(article)}>{article.title}</button></h3>
      {article.subtitle && (
        <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.92rem', margin: '0.2rem 0 0.5rem' }}>
          {article.subtitle}
        </p>
      )}
      <p className="gazetteExcerpt">{article.excerpt || article.description}</p>
      <div className="gazetteByline">
        <span>
          Par <strong>{article.authorName || 'La rédaction'}</strong>
          {article.authorRole ? ` (${article.authorRole})` : ''}
        </span>
        <button type="button" onClick={() => onOpen(article)}>Lire l’article&nbsp; →</button>
      </div>
    </div>
  </article>;
}

export default function CalGazette() {
  const [session, setSession] = useState(getSession());
  const [isSignUp, setIsSignUp] = useState(false);
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [authError, setAuthError] = useState('');

  const userRole = session?.user?.role || 'member';
  const roleLabel = userRole === 'admin' ? 'Administrateur' : userRole === 'editor' ? 'Éditeur' : 'Membre';
  const canAccessStudio = userRole === 'admin' || userRole === 'editor';

  const loadArticles = useCallback(signal => {
    fetchMemberArticles(signal)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          return fetchOfficialArticles(signal).then(official => setArticles(Array.isArray(official) ? official : []));
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') setArticles([]);
      });
  }, []);

  useEffect(() => {
    if (!session) { setArticles([]); return undefined; }
    const controller = new AbortController();
    loadArticles(controller.signal);
    return () => controller.abort();
  }, [session, loadArticles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return articles.filter(article => {
      const matchesCategory = category === 'Toutes' || article.category === category;
      const searchable = `${article.kicker || ''} ${article.location || ''} ${article.title} ${article.subtitle || ''} ${article.excerpt || ''} ${article.description || ''} ${article.authorName || ''} ${(article.tags || []).join(' ')}`.toLocaleLowerCase('fr');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [articles, category, query]);

  const handleAuth = async event => {
    event.preventDefault();
    setAuthError('');
    const data = new FormData(event.currentTarget);
    try {
      if (isSignUp) {
        const newSession = await signUp({
          displayName: data.get('displayName'),
          email: data.get('email'),
          password: data.get('password'),
        });
        setSession(newSession);
      } else {
        const existingSession = await signIn(data.get('email'), data.get('password'));
        setSession(existingSession);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return <main className="calGazette">
    <a className="gazetteBack" href="/">← Retour au site</a>
    <header className="gazetteMasthead">
      <p>ÉDITION DU CERCLE · {formatDate(new Date())}</p>
      <h1>La Gazette<br /><em>des CAL</em></h1>
      <span>Le grand journal des territoires, des idées et de celles et ceux qui les font vivre.</span>
    </header>

    {!session ? (
      <section className="gazetteGate" aria-labelledby="connexion-title">
        <div>
          <p className="gazetteKicker">ESPACE MEMBRE (SANITY)</p>
          <h2 id="connexion-title">{isSignUp ? 'Créer un compte membre' : 'Connexion à l’espace membre'}</h2>
          <p>
            {isSignUp
              ? 'Inscrivez-vous pour accéder à la Gazette.'
              : 'Connectez-vous pour découvrir les articles de la rédaction et les initiatives des CAL.'}
          </p>
        </div>
        <form onSubmit={handleAuth} className="loginForm">
          {isSignUp && (
            <>
              <label htmlFor="gazette-name">Nom ou pseudo</label>
              <input id="gazette-name" name="displayName" type="text" maxLength={60} required />
            </>
          )}
          <label htmlFor="gazette-email">Email</label>
          <input id="gazette-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="gazette-password">Mot de passe</label>
          <input id="gazette-password" name="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required />
          {authError && <p className="formError" role="alert">{authError}</p>}
          <button type="submit">
            {isSignUp ? 'Créer mon compte' : 'Ouvrir la Gazette'} <span>→</span>
          </button>
          <button
            type="button"
            style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S’inscrire'}
          </button>
        </form>
      </section>
    ) : (
      <>
        <div className="gazetteMemberBar">
          <span>Édition membre · {session.user?.displayName || session.user?.email} <strong>({roleLabel})</strong></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {canAccessStudio && (
              <a
                href="http://localhost:3333"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: '600', textDecoration: 'underline' }}
                title="Créer, modifier ou publier des articles dans Sanity Studio"
              >
                ✍️ Rédiger sur Sanity Studio ↗
              </a>
            )}
            <button type="button" onClick={() => { signOut(); setSession(null); }}>Se déconnecter</button>
          </div>
        </div>

        <nav className="gazetteSections" aria-label="Rubriques">
          {categories.map(item => (
            <button
              key={item}
              type="button"
              className={category === item ? 'isActive' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>



        <section className="gazetteTools" aria-label="Rechercher dans la Gazette">
          <label htmlFor="gazette-search">Rechercher un article</label>
          <input
            id="gazette-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Titre, ville, auteur, mots-clés…"
          />
          <span>{filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}</span>
        </section>

        <section className="gazetteArticles" aria-label="Articles de la gazette">
          {filteredArticles.length ? filteredArticles.map((article, index) => (
            <ArticleCard
              key={article._id || index}
              article={article}
              featured={index === 0 && !query && category === 'Toutes'}
              onOpen={setSelectedArticle}
            />
          )) : <p className="gazetteEmpty">Aucun article ne correspond à votre recherche.</p>}
        </section>
      </>
    )}

    {/* Modale d'article Grand Format (style Le Monde / La Dépêche) */}
    {selectedArticle && (
      <div
        className="gazetteDialogBackdrop"
        role="presentation"
        onClick={event => { if (event.target === event.currentTarget) setSelectedArticle(null); }}
      >
        <article className="gazetteDialog" role="dialog" aria-modal="true" aria-labelledby="article-title" style={{ maxWidth: '840px', maxHeight: '92vh', overflowY: 'auto' }}>
          <button type="button" className="gazetteDialogClose" aria-label="Fermer" onClick={() => setSelectedArticle(null)}>×</button>

          {/* Surtitre, Lieu & Rubrique */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {selectedArticle.kicker && (
              <span style={{ fontWeight: '800', letterSpacing: '0.08em', color: '#8d2631', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                {selectedArticle.kicker}
              </span>
            )}
            {selectedArticle.location && (
              <span style={{ background: '#0b1729', color: '#fbf9f4', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                📍 {selectedArticle.location}
              </span>
            )}
            <span style={{ color: '#4e5a60', fontSize: '0.82rem' }}>· {selectedArticle.category || 'Gazette'}</span>
            {selectedArticle.readingTime && (
              <span style={{ color: '#4e5a60', fontSize: '0.82rem' }}>· ⏱ Lecture {selectedArticle.readingTime} min</span>
            )}
          </div>

          {/* Grand Titre */}
          <h2 id="article-title" style={{ fontSize: '2.2rem', lineHeight: '1.22', margin: '0 0 0.6rem', fontFamily: 'serif', color: '#0b1729' }}>
            {selectedArticle.title}
          </h2>

          {/* Sous-titre / Relance */}
          {selectedArticle.subtitle && (
            <p style={{ fontSize: '1.18rem', lineHeight: '1.45', color: '#4e5a60', fontStyle: 'italic', margin: '0 0 1rem' }}>
              {selectedArticle.subtitle}
            </p>
          )}

          {/* Signature & Auteur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '1rem', borderBottom: '1px solid #d9d4c8', marginBottom: '1.3rem' }}>
            {selectedArticle.authorAvatar?.url && (
              <img
                src={selectedArticle.authorAvatar.url}
                alt={selectedArticle.authorName || ''}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.98rem', color: '#0b1729' }}>
                Par {selectedArticle.authorName || 'La rédaction'}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#4e5a60' }}>
                {selectedArticle.authorRole ? `${selectedArticle.authorRole} · ` : ''}Publié le {formatDate(selectedArticle.officialPublishedAt || selectedArticle._createdAt)}
              </p>
            </div>
          </div>

          {/* Photographie principale */}
          {selectedArticle.image?.url && (
            <figure style={{ margin: '0 0 1.5rem' }}>
              <img
                src={selectedArticle.image.url}
                alt={selectedArticle.image.alt || selectedArticle.title}
                style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '440px' }}
              />
              {(selectedArticle.image.caption || selectedArticle.image.credit) && (
                <figcaption style={{ fontSize: '0.82rem', color: '#4e5a60', marginTop: '0.45rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span>{selectedArticle.image.caption}</span>
                  {selectedArticle.image.credit && <span>© {selectedArticle.image.credit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {/* Chapô journalistique */}
          {selectedArticle.excerpt && (
            <div style={{ fontSize: '1.2rem', fontWeight: '500', lineHeight: '1.65', color: '#0b1729', paddingLeft: '1.1rem', borderLeft: '4px solid #8d2631', marginBottom: '1.6rem', fontStyle: 'normal' }}>
              {selectedArticle.excerpt}
            </div>
          )}

          {/* Encadré Repères / En chiffres (style presse régionale et nationale) */}
          {selectedArticle.factbox && (selectedArticle.factbox.title || (Array.isArray(selectedArticle.factbox.items) && selectedArticle.factbox.items.length > 0)) && (
            <aside style={{ margin: '1.5rem 0', padding: '1.2rem 1.4rem', background: '#f4eee3', border: '1px solid #d9d4c8', borderTop: '3px solid #8d2631', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.6rem', color: '#8d2631', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📌 {selectedArticle.factbox.title || 'Repères & Chiffres clés'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.7', color: '#2b363c' }}>
                {(selectedArticle.factbox.items || []).map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{item}</li>
                ))}
              </ul>
            </aside>
          )}

          {/* Citation en exergue (Pull-quote) */}
          {selectedArticle.quote?.text && (
            <blockquote style={{ margin: '1.8rem 0', padding: '1.2rem 1.6rem', background: '#f4eee3', borderLeft: '4px solid #8d2631', borderRadius: '4px', fontStyle: 'italic', fontSize: '1.15rem', color: '#0b1729' }}>
              « {selectedArticle.quote.text} »
              {selectedArticle.quote.author && (
                <cite style={{ display: 'block', fontSize: '0.88rem', color: '#4e5a60', marginTop: '0.5rem', fontStyle: 'normal' }}>
                  — {selectedArticle.quote.author}
                </cite>
              )}
            </blockquote>
          )}

          {/* Corps de l'article avec typographie aérée */}
          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.9', fontSize: '1.08rem', color: '#2b363c', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {selectedArticle.body || selectedArticle.description}
          </div>

          {/* Galerie de photos de reportage */}
          {Array.isArray(selectedArticle.gallery) && selectedArticle.gallery.length > 0 && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #d9d4c8' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0b1729' }}>📸 En images</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {selectedArticle.gallery.map((img, idx) => (
                  <figure key={idx} style={{ margin: 0 }}>
                    <img src={img.url} alt={img.alt || `Photo ${idx + 1}`} style={{ width: '100%', borderRadius: '6px', height: '180px', objectFit: 'cover' }} />
                    {img.caption && <figcaption style={{ fontSize: '0.78rem', color: '#4e5a60', marginTop: '0.3rem' }}>{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* Tags thématiques */}
          {Array.isArray(selectedArticle.tags) && selectedArticle.tags.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #d9d4c8', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4e5a60' }}>Mots-clés :</span>
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} style={{ fontSize: '0.78rem', background: '#eee9de', border: '1px solid #d9d4c8', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#2b363c' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Galerie de photos de reportage */}
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

          {/* Tags thématiques */}
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
  </main>;
}
