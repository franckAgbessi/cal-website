import { useEffect, useRef, useState } from 'react';
import { fetchOfficialArticles, getSession, signIn, signOut, submitArticle } from './calApi';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value)) : 'Aujourd’hui';
}

export default function CalGazette() {
  const [session, setSession] = useState(getSession());
  const [articles, setArticles] = useState([]);
  const [loginError, setLoginError] = useState('');
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const [imageData, setImageData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!session) { setArticles([]); return undefined; }
    const controller = new AbortController();
    fetchOfficialArticles(controller.signal)
      .then(data => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));
    return () => controller.abort();
  }, [session]);

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
      formRef.current?.reset(); setImageData(null);
    } catch (error) { setSubmitState({ status: 'error', message: error.message }); }
  };

  return <main className="calGazette">
    <a className="gazetteBack" href="/">← Retour au site</a>
    <header className="gazetteMasthead">
      <p>ÉDITION DU CERCLE · {formatDate(new Date())}</p>
      <h1>La Gazette<br /><em>des CAL</em></h1>
      <span>La parole des territoires, éditée par le mouvement.</span>
    </header>

    {!session ? <section className="gazetteGate" aria-labelledby="connexion-title">
      <div><p className="gazetteKicker">ESPACE MEMBRE</p><h2 id="connexion-title">La rédaction est réservée aux membres.</h2><p>Connectez-vous pour lire la gazette complète, commenter les initiatives et proposer votre article.</p></div>
      <form onSubmit={login} className="loginForm">
        <label htmlFor="gazette-email">Email</label><input id="gazette-email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="gazette-password">Mot de passe</label><input id="gazette-password" name="password" type="password" autoComplete="current-password" required />
        {loginError && <p className="formError" role="alert">{loginError}</p>}
        <button type="submit">Se connecter <span>→</span></button>
      </form>
    </section> : <>
      <div className="gazetteMemberBar"><span>Connecté·e en tant que {session.user?.email}</span><button type="button" onClick={() => { signOut(); setSession(null); }}>Se déconnecter</button></div>
      <section className="gazetteLead" aria-labelledby="gazette-title">
        <div><p className="gazetteKicker">À LA UNE</p><h2 id="gazette-title">Les nouvelles officiellement publiées</h2><p>Les propositions des membres sont relues par l’équipe éditoriale avant une publication sur la page officielle.</p></div>
        <a href="#proposer" className="gazetteCta">Écrire un article <span>↓</span></a>
      </section>
      <section className="gazetteArticles" aria-label="Articles officiels">
        {articles.length ? articles.map(article => <article id={`article-${article._id}`} key={article._id} className="gazetteArticle">
          {article.image?.url && <img src={article.image.url} alt={article.image.alt || ''} />}
          <div><p className="gazetteKicker">{article.category || 'GAZETTE'} · {formatDate(article.officialPublishedAt)}</p><h3>{article.title}</h3><p>{article.description}</p>{article.authorName && <small>Par {article.authorName}</small>}</div>
        </article>) : <p className="gazetteEmpty">La prochaine édition est en préparation.</p>}
      </section>
      <section className="articleComposer" id="proposer" aria-labelledby="composer-title">
        <div><p className="gazetteKicker">TRIBUNE MEMBRE</p><h2 id="composer-title">Proposer un article</h2><p>Votre article reste privé pour les membres tant que la rédaction ne l’a pas validé pour la page officielle.</p></div>
        <form ref={formRef} onSubmit={publish}>
          <div className="composerGrid"><label>Titre<input name="title" maxLength="120" required /></label><label>Votre nom ou pseudo<input name="authorName" maxLength="60" required /></label></div>
          <div className="composerGrid"><label>Rubrique<select name="category" defaultValue="Vie locale"><option>Vie locale</option><option>Initiative</option><option>Portrait</option><option>Débat</option></select></label><label>Visibilité souhaitée<select name="publicationIntent" defaultValue="members"><option value="members">Gazette des membres</option><option value="official-request">Proposer à la page officielle</option></select></label></div>
          <label>Image (facultative)<input name="image" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} /></label>
          <label>Article<textarea name="body" rows="9" maxLength="8000" required placeholder="Racontez une action, une rencontre ou une idée à partager…" /></label>
          {submitState.message && <p className={submitState.status === 'error' ? 'formError' : 'formSuccess'} role="status">{submitState.message}</p>}
          <button type="submit" disabled={submitState.status === 'sending'}>{submitState.status === 'sending' ? 'Envoi…' : 'Envoyer à la rédaction'} <span>→</span></button>
        </form>
      </section>
    </>}
  </main>;
}
