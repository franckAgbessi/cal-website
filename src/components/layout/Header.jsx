import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../Image/logo.png';

const links = [{ href: '/#le-cercle', label: 'Le Cercle' }, { href: '/#histoire', label: 'Histoire' }, { to: '/actualites', label: 'Actualités' }, { href: '/#contact', label: 'Contact' }];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => { const listener = () => setScrolled(window.scrollY > 18); listener(); window.addEventListener('scroll', listener, { passive: true }); return () => window.removeEventListener('scroll', listener); }, []);
  return <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
    <div className="shell site-header__inner">
      <Link to="/" className="brand" aria-label="Occitan Royaliste — accueil"><img src={logo} alt="" /><span><strong>Occitan Royaliste</strong><small>Cercle d’Action Légitimiste de Toulouse</small></span></Link>
      <nav className={open ? 'main-nav main-nav--open' : 'main-nav'} aria-label="Navigation principale">
        {links.map((link) => link.href ? <a key={link.href} href={link.href}>{link.label}</a> : <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
        <a className="nav-join" href="/#contact">Nous rejoindre</a>
      </nav>
      <button className="menu-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
  </header>;
}
