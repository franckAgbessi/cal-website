import { Link } from 'react-router-dom';
export default function NotFound() { return <main className="page shell not-found"><p className="eyebrow">404</p><h1>Cette page n’a pas été trouvée.</h1><p>Le contenu demandé a peut-être été déplacé ou n’existe plus.</p><Link className="button button--gold" to="/">Retour à l’accueil</Link></main>; }
