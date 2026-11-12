# Getting Started with Create React App

## Gazette des CAL (`/cal`)

La nouvelle page `/cal` est un espace membre : l’utilisateur se connecte avant de consulter la gazette et de proposer un article. Une proposition contient un titre, un texte, une image facultative, une rubrique et le nom ou pseudo de son auteur·rice.

### Sécurité et publication

Les mots de passe ne sont pas stockés dans Sanity. Créez les comptes email/mot de passe dans **Supabase Auth**, puis créez le profil associé dans Sanity. Cette séparation évite de rendre les identifiants accessibles depuis le CMS.

1. Créez un dataset Sanity privé, par exemple avec `npx sanity datasets create members --visibility private`.
2. Lancez le Studio depuis ce dossier avec `npm run sanity` (ou `npx sanity dev`) : sa configuration et les schémas `calMember` / `calArticle` sont déjà inclus.
3. Pour chaque personne, allez dans **Supabase → Authentication → Users → Add user → Send invitation**. Après le lien reçu par email, la page `/activer-compte` lui demandera de choisir son mot de passe puis l’ouvrira dans `/cal`. Copiez ensuite l’identifiant UUID du compte Supabase dans le document **Membre CAL** de Sanity, avec son email, son pseudo et son rôle.
4. Dans Supabase, renseignez `https://votre-domaine.fr/activer-compte` comme **Site URL** dans **Authentication → URL Configuration** et autorisez aussi `http://localhost:3000/**`. Copiez [`.env.example`](./.env.example) en `.env.local` pour le site. Le jeton Sanity d’écriture ne doit jamais porter le préfixe `REACT_APP_`.
5. Sur Hostinger, le site est une application **Express** (`server.js`) : elle sert le build React et les routes `api/articles` et `api/official-articles`. Dans hPanel, type d’application `express`, fichier d’entrée `server.js`, script de build `build`, répertoire de sortie vide. Ajoutez les variables de [`.env.example`](./.env.example) dans **Environment variables**, puis redéployez.

Les nouvelles propositions arrivent avec le statut **À relire**. Une personne ayant le rôle éditorial les valide dans Sanity en choisissant **Page officielle** et une date de publication. Elles apparaissent alors automatiquement dans le carrousel de la page d’accueil et dans la Gazette. Ce filtre est fait côté serveur : ni les brouillons ni les emails ne sont exposés au navigateur.

Pour les essais locaux, `npm run dev` branche les mêmes routes API. `npm start` lance le serveur de production après `npm run build`. Sans configuration, le site conserve les cartes du journal existant et affiche un message clair sur la page Gazette.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
