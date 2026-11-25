import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/format';

export default function ArticleCard({ article, featured = false }) {
  const category = article.category?.title || 'Publications';
  return <article className={`article-card ${featured ? 'article-card--featured' : ''}`}>
    <Link className="article-card__image" to={`/articles/${article.slug}`} aria-label={`Lire ${article.title}`}><img src={article.coverUrl} alt={article.coverAlt || ''} loading={featured ? 'eager' : 'lazy'} /></Link>
    <div className="article-card__body"><p className="meta"><span>{category}</span>{article.publishedAt && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}</p><h3><Link to={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link className="text-link" to={`/articles/${article.slug}`}>Lire l’article</Link></div>
  </article>;
}
