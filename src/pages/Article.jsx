import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Mail } from 'lucide-react';
import ArticleBody from '../components/articles/ArticleBody';
import ArticleCard from '../components/articles/ArticleCard';
import Loading from '../components/ui/Loading';
import useSanityQuery from '../hooks/useSanityQuery';
import { articleBySlugQuery } from '../sanity/queries';
import { formatDate, headingId, readingTime } from '../lib/format';
import { setPageMeta } from '../lib/seo';

export default function Article() {
  const { slug } = useParams();
  const result = useSanityQuery(articleBySlugQuery, { slug }, null);
  const [progress, setProgress] = useState(0);
  const article = useMemo(() => result.data, [result.data]);
  const headings = useMemo(() => (article?.body || []).filter((block) => block.style === 'h2' || block.style === 'h3').map((block) => ({ id: headingId(block), label: block.children?.map((child) => child.text).join('') })), [article]);
  useEffect(() => { if (article) setPageMeta({ title: article.title, description: article.excerpt, type: 'article' }); }, [article]);
  useEffect(() => { const listener = () => { const doc = document.documentElement; setProgress(Math.min(100, (window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)) * 100)); }; window.addEventListener('scroll', listener, { passive: true }); listener(); return () => window.removeEventListener('scroll', listener); }, []);
  const copy = () => navigator.clipboard?.writeText(window.location.href);
  if (result.loading) return <main className="page shell article-loading"><Loading label="Chargement de l’article…" /></main>;
  if (!article) return <main className="page shell not-found"><p className="eyebrow">404</p><h1>Article introuvable.</h1><p>Cette publication n’existe pas ou n’est pas publiée.</p><Link className="text-link" to="/actualites">Retour aux publications</Link></main>;
  return <main className="article-page"><div className="reading-progress" style={{ width: `${progress}%` }} /><article><header className="article-header shell"><Link className="back-link" to="/actualites"><ArrowLeft size={17} /> Toutes les publications</Link><p className="eyebrow">{article.category?.title || 'Publications'}</p><h1>{article.title}</h1>{article.excerpt && <p className="article-chapo">{article.excerpt}</p>}<p className="article-byline">Par {article.author?.name || 'La rédaction'} · <time>{formatDate(article.publishedAt)}</time> · {article.readingTime || readingTime(article.body)} min de lecture</p></header>
    {article.coverUrl && <figure className="article-cover"><img src={article.coverUrl} alt={article.coverAlt || ''} />{(article.coverImageCaption || article.caption || article.credit) && <figcaption>{article.coverImageCaption || article.caption}{article.credit && ` — ${article.credit}`}</figcaption>}</figure>}
    <div className="article-layout shell"><aside className="article-aside">{headings.length > 0 && <nav aria-label="Sommaire"><p>Dans cet article</p>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.label}</a>)}</nav>}<div className="share"><p>Partager</p><button aria-label="Copier le lien" onClick={copy}><Copy size={17} /></button><a aria-label="Partager par e-mail" href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(window.location.href)}`}><Mail size={17} /></a><a aria-label="Partager sur LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">in</a></div></aside><ArticleBody value={article.body || []} /></div>
    {(article.bibliography?.length || article.sources?.length) && <section className="bibliography shell"><h2>Sources & bibliographie</h2>{article.sources?.length > 0 && <ul>{article.sources.map((source, index) => <li key={index}>{typeof source === 'string' ? source : [source.author, source.title, source.publication].filter(Boolean).join(', ')}</li>)}</ul>}{article.bibliography?.length > 0 && <ul>{article.bibliography.map((item, index) => <li key={index}>{typeof item === 'string' ? item : [item.author, item.title, item.publication].filter(Boolean).join(', ')}</li>)}</ul>}</section>}
    {(article.relatedArticles || article.related)?.length > 0 && <section className="related section--warm"><div className="shell"><h2>À lire également</h2><div className="article-grid">{(article.relatedArticles || article.related).slice(0, 3).map((item) => <ArticleCard key={item._id} article={item} />)}</div></div></section>}
  </article></main>;
}
