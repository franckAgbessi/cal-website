# Occitan Royaliste — Cercle d’Action Légitimiste de Toulouse

Site institutionnel et revue éditoriale React, administrés avec Sanity Studio.

## Démarrer

```bash
npm install
cp .env.example .env.local
npm start
```

Le site est accessible sur `http://localhost:3000`. Le Studio se lance avec `npm run sanity`.

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `REACT_APP_SANITY_PROJECT_ID` | Identifiant public du projet Sanity. |
| `REACT_APP_SANITY_DATASET` | Dataset public, habituellement `production`. |
| `REACT_APP_SANITY_API_VERSION` | Version d’API Sanity figée. |
| `REACT_APP_SITE_URL` | URL publique du site lors du déploiement. |

Le navigateur utilise uniquement le client Sanity en lecture et ne doit jamais recevoir un jeton privé.

## Administration éditoriale

Les documents Sanity disponibles sont : Accueil, Article, Catégorie, Auteur, Paramètres du site, Le Cercle, Histoire & patrimoine et Contact. Les documents réutilisent les objets CTA, SEO, image enrichie, section éditoriale et référence historique.

Un article doit avoir le statut `Publié` pour apparaître sur le site public. Les brouillons et contenus archivés ne sont jamais demandés par les requêtes publiques. En l’absence de contenu Sanity, le site présente uniquement des contenus de démonstration clairement identifiés.

## Vérifications et déploiement

```bash
npm run build
npx sanity schema validate
```

Le build statique est produit dans `build/` et peut être déployé sur Vercel, Netlify ou tout hébergement statique configuré pour rediriger les routes vers `index.html`.
