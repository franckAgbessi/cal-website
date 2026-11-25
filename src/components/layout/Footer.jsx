import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { fallbackSite } from '../../data/fallbackContent';
import logo from '../../Image/logo.png';

export default function Footer({ settings = {} }) {
  const year = new Date().getFullYear();
  return <footer className="site-footer"><div className="shell footer-grid">
    <div><div className="footer-brand"><img src={settings.logoUrl || logo} alt="" /><strong>{settings.siteName || fallbackSite.shortName}</strong></div><p>{settings.footerDescription || fallbackSite.description}</p></div>
    <div><p className="footer-label">Le Cercle</p><a href="/#le-cercle">Notre démarche</a><a href="/#histoire">Histoire & patrimoine</a><Link to="/actualites">Publications</Link></div>
    <div><p className="footer-label">Nous écrire</p><a href={`mailto:${settings.contactEmail || fallbackSite.email}`}><Mail size={16} /> {settings.contactEmail || fallbackSite.email}</a><Link to="/mentions-legales">Mentions légales</Link></div>
  </div><div className="shell footer-bottom"><span>© {year} Cercle d’Action Légitimiste de Toulouse</span><span>Occitan Royaliste</span></div></footer>;
}
