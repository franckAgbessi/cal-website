export function setPageMeta({ title, description, type = 'website' }) {
  document.title = title ? `${title} | Occitan Royaliste` : 'Occitan Royaliste — Cercle d’Action Légitimiste de Toulouse';
  const update = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute('content', value);
  };
  update('meta[name="description"]', description);
  update('meta[property="og:title"]', document.title);
  update('meta[property="og:description"]', description);
  update('meta[property="og:type"]', type);
}
