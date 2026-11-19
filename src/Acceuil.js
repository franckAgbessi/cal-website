import { useEffect, useState } from 'react';
import { client } from './SanityConnect';
import './App.scss';
import HeroImage from './Image/hero.jpg';
import defaults from './content/defaultContent.json';
import { safeHref, getOptimizedImageUrl } from './content/siteContent';

export const accueilQuery = `*[_type == "accueil"] | order(_updatedAt desc)[0] {
  surtitre,
  titre,
  titreSuite,
  accent,
  description,
  "logo": {
    "url": logo.asset->url,
    "alt": coalesce(logo.alt, alt)
  },
  "image": {
    "url": image.asset->url,
    "alt": coalesce(image.alt, alt)
  },
  "principal": {
    "label": coalesce(principal.label, principal.texte, boutonPrincipal.texte, boutonPrincipal.label),
    "href": coalesce(principal.href, principal.lien, boutonPrincipal.lien, boutonPrincipal.href)
  },
  "secondaire": {
    "label": coalesce(secondaire.label, secondaire.texte, boutonSecondaire.texte, boutonSecondaire.label),
    "href": coalesce(secondaire.href, secondaire.lien, boutonSecondaire.lien, boutonSecondaire.href)
  }
}`;

function ContentLink({ value, className, arrow }) {
  const href = safeHref(value?.href || value?.lien);
  if (!href) return null;
  const external = /^https?:/i.test(href);
  const label = value?.label || value?.texte;
  return (
    <a
      className={className}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
      {arrow && <span aria-hidden="true">{arrow}</span>}
    </a>
  );
}

function Acceuil({ content }) {
  const [localAccueil, setLocalAccueil] = useState(null);

  useEffect(() => {
    // Si aucun contenu n'a été fourni en prop, on charge directement depuis Sanity
    if (!content) {
      let actif = true;
      const controller = new AbortController();

      client.fetch(accueilQuery, {}, { signal: controller.signal })
        .then((data) => {
          if (actif && data) setLocalAccueil(data);
        })
        .catch(() => {
          // Utilisation du contenu par défaut
        });

      return () => {
        actif = false;
        controller.abort();
      };
    }
  }, [content]);

  const accueilData = content || localAccueil || defaults.accueil;

  const principal = {
    label: accueilData?.principal?.label || accueilData?.principal?.texte || accueilData?.boutonPrincipal?.texte || defaults.accueil.principal.label,
    href: accueilData?.principal?.href || accueilData?.principal?.lien || accueilData?.boutonPrincipal?.lien || defaults.accueil.principal.href,
  };

  const secondaire = {
    label: accueilData?.secondaire?.label || accueilData?.secondaire?.texte || accueilData?.boutonSecondaire?.texte || defaults.accueil.secondaire.label,
    href: accueilData?.secondaire?.href || accueilData?.secondaire?.lien || accueilData?.boutonSecondaire?.lien || defaults.accueil.secondaire.href,
  };

  return (
    <section className="Acceuil" id="acceuil" aria-labelledby="accueil-title">
      <div className="section">
        <div className="aside">
          {accueilData.logo?.url && (
            <img
              src={getOptimizedImageUrl(accueilData.logo.url, { width: 240, quality: 85 })}
              alt={accueilData.logo.alt || ''}
              className="heroLogo"
              decoding="async"
              style={{ maxHeight: '56px', width: 'auto', marginBottom: '1.25rem', objectFit: 'contain' }}
            />
          )}

          {accueilData.surtitre && (
            <p className="surtitre">{accueilData.surtitre}</p>
          )}

          <h1 className="title" id="accueil-title">
            {accueilData.titre}
            {accueilData.titreSuite && (
              <>
                <br />
                {accueilData.titreSuite}{' '}
              </>
            )}
            {accueilData.accent && <span>{accueilData.accent}</span>}
          </h1>

          {accueilData.description && (
            <p className="description">{accueilData.description}</p>
          )}

          <div className="bouton">
            <ContentLink className="btn btnPlein" value={principal} arrow="↓" />
            <ContentLink className="btn btnOut" value={secondaire} arrow="↓" />
          </div>
        </div>

        <img
          src={getOptimizedImageUrl(accueilData.image?.url, { width: 1200, quality: 80 }) || HeroImage}
          alt={accueilData.image?.alt || accueilData.imageAlt || "Illustration du Cercle d’action légitimiste"}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}

export default Acceuil;
