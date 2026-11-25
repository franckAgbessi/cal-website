import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.scss';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import News from './pages/News';
import Article from './pages/Article';
import { Legal } from './pages/Institutional';
import NotFound from './pages/NotFound';
import useSanityQuery from './hooks/useSanityQuery';
import { siteSettingsQuery } from './sanity/queries';

function Site() {
  const { data: settings } = useSanityQuery(siteSettingsQuery, {}, {});
  return <BrowserRouter><Header /><Routes><Route path="/" element={<Home />} /><Route path="/actualites" element={<News />} /><Route path="/articles/:slug" element={<Article />} /><Route path="/le-cercle" element={<Navigate to="/#le-cercle" replace />} /><Route path="/histoire" element={<Navigate to="/#histoire" replace />} /><Route path="/contact" element={<Navigate to="/#contact" replace />} /><Route path="/mentions-legales" element={<Legal />} /><Route path="*" element={<NotFound />} /></Routes><Footer settings={settings || {}} /></BrowserRouter>;
}
export default Site;
