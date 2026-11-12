import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchOfficialArticles, getSession, signIn, signOut, submitArticle } from './calApi';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const categories = ['Toutes', 'Vie locale', 'Initiative', 'Portrait', 'Débat', 'Culture', 'Agenda'];

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
    : 'Aujourd’hui';
}

function ArticleCard({ article, featured = false, onOpen }) {
  return <article className={`gazetteArticle ${featured ? 'gazetteArticleFeatured' : ''}`}>
    {article.image?.url && <img src={article.image.url} alt={article.image.alt || ''} />}
    <div className="gazetteArticleBody">
      <p className="gazetteKicker">{article.category || 'Gazette'} · {formatDate(article.officialPublishedAt)}</p>
      <h3><button type="button" onClick={() => onOpen(article)}>{article.title}</button></h3>
      <p className="gazetteExcerpt">{article.description}</p>
      <div className="gazetteByline"><span>Par {article.authorName || 'La rédaction'}</span><button type="button" onClick={() => onOpen(article)}>Lire l’article&nbsp; →</button></div>
    </div>
  </article>;
}

export default function CalGazette() {
  const [session, setSession] = useState(getSession());
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [imageData, setImageData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!session) { setArticles([]); return undefined; }
    const controller = new AbortController();
    fetchOfficialArticles(controller.signal)
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(error => { if (error.name !== 'AbortError') setArticles([]); });
    return () => controller.abort();
  }, [session]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return articles.filter(article => {
      const matchesCategory = category === 'Toutes' || article.category === category;
      const searchable = `${article.title} ${article.description} ${article.authorName}`.toLocaleLowerCase('fr');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [articles, category, query]);

  const login = async event => {
    event.preventDefault();
    setLoginError('');
    const data = new FormData(event.currentTarget);
    try { setSession(await signIn(data.get('email'), data.get('password'))); }
    catch (error) { setLoginError(error.message); }
  };

  const selectImage = event => {
    const file = event.target.files?.[0];
    if (!file) return setImageData(null);
    if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) {
      event.target.value = '';
      setImageData(null);
      setSubmitState({ status: 'error', message: 'Choisissez une image de moins de 3 Mo.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageData({ dataUrl: reader.result, name: file.name, type: file.type });
    reader.readAsDataURL(file);
  };

  const publish = async event => {
    event.preventDefault();
    if (!session || session.expiresAt < Date.now()) { signOut(); setSession(null); return; }
    const data = new FormData(event.currentTarget);
    setSubmitState({ status: 'sending', message: '' });
    try {
      const article = await submitArticle(session, {
        title: data.get('title'), body: data.get('body'), category: data.get('category'),
        authorName: data.get('authorName'), publicationIntent: data.get('publicationIntent'), image: imageData,
      });
      setSubmitState({ status: 'success', message: article.message || 'Votre article a été envoyé à la rédaction.' });
      formRef.current?.reset();
      setImageData(null);
    } catch (error) { setSubmitState({ status: 'error', message: error.message }); }
  };

  return <main className="calGazette">
    <a className="gazetteBack" href="/">← Retour au site</a>
    <header className="gazetteMasthead">
      <p>ÉDITION DU CERCLE · {formatDate(new Date())}</p>
      <h1>La Gazette<br /><em>des CAL</em></h1>
      <span>Le journal des territoires, des idées et de celles et ceux qui les font vivre.</span>
    </header>

    {!session ? <section className="gazetteGate" aria-labelledby="connexion-title">
      <div><p className="gazetteKicker">ESPACE MEMBRE</p><h2 id="connexion-title">Le journal est réservé aux membres.</h2><p>Connectez-vous pour découvrir les articles de la rédaction, les initiatives locales et les tribunes du mouvement.</p></div>
      <form onSubmit={login} className="loginForm">
        <label htmlFor="gazette-email">Email</label><input id="gazette-email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="gazette-password">Mot de passe</label><input id="gazette-password" name="password" type="password" autoComplete="current-password" required />
        {loginError && <p className="formError" role="alert">{loginError}</p>}
        <button type="submit">Ouvrir la Gazette <span>→</span></button>
      </form>
    </section> : <>
      <div className="gazetteMemberBar"><span>Édition membre · {session.user?.email}</span><button type="button" onClick={() => { signOut(); setSession(null); }}>Se déconnecter</button></div>
      <nav className="gazetteSections" aria-label="Rubriques">
        {categories.map(item => <button key={item} type="button" className={category === item ? 'isActive' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </nav>
      <section className="gazetteLead" aria-labelledby="gazette-title">
        <div><p className="gazetteKicker">LE JOURNAL · {formatDate(new Date())}</p><h2 id="gazette-title">Ce qui se passe ici mérite d’être raconté.</h2><p>Une sélection d’articles relus et publiés par l’équipe éditoriale des CAL.</p></div>
        <a href="#proposer" className="gazetteCta">Proposer un article <span>↓</span></a>
      </section>
      <section className="gazetteTools" aria-label="Rechercher dans la Gazette">
        <label htmlFor="gazette-search">Rechercher un article</label>
        <input id="gazette-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Titre, sujet, auteur…" />
        <span>{filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}</span>
      </section>
      <section className="gazetteArticles" aria-label="Articles officiels">
        {filteredArticles.length ? filteredArticles.map((article, index) => <ArticleCard key={article._id} article={article} featured={index === 0 && !query && category === 'Toutes'} onOpen={setSelectedArticle} />) : <p className="gazetteEmpty">Aucun article ne correspond à votre recherche.</p>}
      </section>
      <section className="articleComposer" id="proposer" aria-labelledby="composer-title">
        <div><p className="gazetteKicker">TRIBUNE MEMBRE</p><h2 id="composer-title">Votre terrain est notre première source.</h2><p>Racontez une action, une rencontre ou une idée. La rédaction relit chaque proposition avant publication.</p></div>
        <form ref={formRef} onSubmit={publish}>
          <div className="composerGrid"><label>Titre<input name="title" maxLength="120" required /></label><label>Votre nom ou pseudo<input name="authorName" maxLength="60" required /></label></div>
          <div className="composerGrid"><label>Rubrique<select name="category" defaultValue="Vie locale">{categories.slice(1).map(item => <option key={item}>{item}</option>)}</select></label><label>Visibilité souhaitée<select name="publicationIntent" defaultValue="members"><option value="members">Gazette des membres</option><option value="official-request">Proposer à la page officielle</option></select></label></div>
          <label>Image (facultative)<input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} /></label>
          <label>Article<textarea name="body" rows="9" maxLength="8000" required placeholder="Racontez ce qui s’est passé, pourquoi c’est important et ce qu’il faut retenir…" /></label>
          {submitState.message && <p className={submitState.status === 'error' ? 'formError' : 'formSuccess'} role="status">{submitState.message}</p>}
          <button type="submit" disabled={submitState.status === 'sending'}>{submitState.status === 'sending' ? 'Envoi…' : 'Envoyer à la rédaction'} <span>→</span></button>
        </form>
      </section>
    </>}
    {selectedArticle && <div className="gazetteDialogBackdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setSelectedArticle(null); }}>
      <article className="gazetteDialog" role="dialog" aria-modal="true" aria-labelledby="article-title">
        <button type="button" className="gazetteDialogClose" aria-label="Fermer" onClick={() => setSelectedArticle(null)}>×</button>
        {selectedArticle.image?.url && <img src={selectedArticle.image.url} alt={selectedArticle.image.alt || ''} />}
        <p className="gazetteKicker">{selectedArticle.category} · {formatDate(selectedArticle.officialPublishedAt)}</p>
        <h2 id="article-title">{selectedArticle.title}</h2>
        <p className="gazetteDialogByline">Par {selectedArticle.authorName || 'La rédaction'}</p>
        <p className="gazetteDialogText">{selectedArticle.body || selectedArticle.description}</p>
      </article>
    </div>}
  </main>;
}
