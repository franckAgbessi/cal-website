import { PortableText } from '@portabletext/react';
import { imageUrl } from '../../sanity/client';
import { headingId } from '../../lib/format';

const components = {
  block: { h2: ({ children, value }) => <h2 id={headingId(value)}>{children}</h2>, h3: ({ children, value }) => <h3 id={headingId(value)}>{children}</h3>, blockquote: ({ children }) => <blockquote>{children}</blockquote> },
  marks: { link: ({ value, children }) => <a href={value?.href} target={value?.blank ? '_blank' : undefined} rel="noreferrer">{children}</a> },
  types: { image: ({ value }) => <figure><img src={imageUrl(value, 1200)} alt={value.alt || ''} loading="lazy" />{value.caption && <figcaption>{value.caption}{value.credit && ` — ${value.credit}`}</figcaption>}</figure> },
};
export default function ArticleBody({ value }) { return <div className="article-body"><PortableText value={value || []} components={components} /></div>; }
