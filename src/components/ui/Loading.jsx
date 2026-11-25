export default function Loading({ label = 'Chargement des contenus…' }) {
  return <div className="loading" role="status"><span className="loading__line" /><span>{label}</span></div>;
}
