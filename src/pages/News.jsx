import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import ArticleCard from '../components/articles/ArticleCard';
import Loading from '../components/ui/Loading';
import useSanityQuery from '../hooks/useSanityQuery';
import { articleCountQuery, articleListQuery, categoriesQuery, featuredArticleQuery } from '../sanity/queries';
import { setPageMeta } from '../lib/seo';

const PER_PAGE = 6;
export default function News() {
  const [params, setParams] = useSearchParams();
  const category = params.get('categorie') || '';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(q);
  const variables = { category: category || null, search: q ? `*${q}*` : null, start: (page - 1) * PER_PAGE, end: page * PER_PAGE };
  const articleResult = useSanityQuery(articleListQuery, variables, []);
  const countResult = useSanityQuery(articleCountQuery, { category: category || null, search: q ? `*${q}*` : null }, 0);
  const categoriesResult = useSanityQuery(categoriesQuery, {}, []);
  const featuredResult = useSanityQuery(featuredArticleQuery, {}, null);
  const articles = articleResult.data || [];
  const categories = categoriesResult.data || [];
  const total = countResult.data || 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const featured = featuredResult.data;
  const update = (next) => { const merged = new URLSearchParams(params); Object.entries(next).forEach(([key, value]) => value ? merged.set(key, value) : merged.delete(key)); if (!Object.prototype.hasOwnProperty.call(next, 'page')) merged.set('page', '1'); setParams(merged); };
  useEffect(() => { setSearch(q); }, [q]);
  useEffect(() => setPageMeta({ title: 'Actualités & Articles', description: 'Analyses, récits historiques et regards sur le patrimoine français et toulousain.' }), []);
  const visible = featured ? articles.filter((article) => article._id !== featured._id) : articles;
  return <main className="page"><header className="page-hero shell"><p className="eyebrow">PUBLICATIONS DU CERCLE</p><h1>Actualités <em>&amp;</em> Articles</h1><p>Analyses, récits historiques et regards sur le patrimoine français et toulousain.</p></header>
    {featured && <section className="shell featured-news"><ArticleCard article={featured} featured /></section>}
    <section className="shell news-controls" aria-label="Filtrer les articles"><form onSubmit={(event) => { event.preventDefault(); update({ q: search }); }}><label htmlFor="article-search" className="sr-only">Rechercher dans les articles</label><Search size={18} /><input id="article-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une publication" /><button type="submit">Rechercher</button></form><div className="filter-row"><SlidersHorizontal size={17} /><button className={!category ? 'is-active' : ''} onClick={() => update({ categorie: '' })}>Tous</button>{categories.map((item) => <button key={item.slug} className={category === item.slug ? 'is-active' : ''} onClick={() => update({ categorie: item.slug })}>{item.title}</button>)}</div></section>
    <section className="shell news-list"><div className="news-list__head"><p>{total} publication{total > 1 ? 's' : ''}</p>{articleResult.loading && <Loading label="Mise à jour…" />}</div>{!articleResult.loading && !visible.length ? <div className="empty-state"><h2>{q || category ? 'Aucune publication trouvée' : 'Aucune publication publiée'}</h2><p>{q || category ? 'Modifiez votre recherche ou choisissez une autre rubrique.' : 'Les prochaines actualités du Cercle paraîtront ici dès leur publication dans Sanity.'}</p></div> : <div className="article-grid">{visible.map((article) => <ArticleCard key={article._id} article={article} />)}</div>}
      {pages > 1 && <nav className="pagination" aria-label="Pagination">{Array.from({ length: pages }, (_, index) => index + 1).map((item) => <button key={item} className={item === page ? 'is-active' : ''} aria-current={item === page ? 'page' : undefined} onClick={() => update({ page: String(item) })}>{item}</button>)}</nav>}</section>
  </main>;
}
