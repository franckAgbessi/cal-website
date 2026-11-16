# CAL — Site & Gazette des CAL (ReactJS + Sanity)

Ce projet fonctionne **100% en frontend avec ReactJS et Sanity CMS**. Il ne nécessite **aucun backend ni serveur d'API**.

---

## Fonctionnalités

1. **Site vitrine (`/`)** : Présentation des CAL, manifeste, cercles locaux et formulaire de contact.
2. **La Gazette des CAL (`/cal`)** :
   * **Gestion des membres avec Sanity** : Inscription directe depuis le site (`signUp`) ou création manuelle d'utilisateurs (`calMember`) dans le Sanity Studio.
   * **Connexion / Authentification** : Vérification des identifiants et mot de passe directement via le client Sanity (mots de passe hachés en SHA-256).
   * **Consultation d'articles** : Lecture des articles officiels et des contributions des membres.
   * **Rédaction d'articles** : Soumission directe d'articles et téléversement d'images directement vers Sanity (`calArticle`).
3. **Studio Sanity (`npm run sanity`)** : Interface visuelle pour gérer les membres, relire les articles et publier les contenus.

---

## Variables d'environnement (`.env.local`)

Créez un fichier `.env.local` à la racine :

```env
REACT_APP_SANITY_PROJECT_ID=gacrkjml
REACT_APP_SANITY_DATASET=production

# Token Sanity avec droits d'écriture (Editor ou Write)
# Nécessaire pour permettre la création de comptes membres et le téléversement d'articles
REACT_APP_SANITY_WRITE_TOKEN=votre-token-sanity-write
```

---

## Commandes disponibles

* `npm start` ou `npm run dev` : Démarre l'application React en local sur `http://localhost:3000`.
* `npm run sanity` : Lance le Studio Sanity en local sur `http://localhost:3333` pour gérer les membres et les articles.
* `npm run build` : Compile le site en fichiers statiques dans le dossier `build/` (déployable sur Vercel, Netlify, Hostinger ou GitHub Pages).
* `npm test` : Lance la suite de tests unitaires.
