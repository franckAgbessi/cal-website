import { franceRings, hasMapCoordinates, projectCoordinates } from '../content/franceGeometry';
import { getOptimizedImageUrl } from '../content/siteContent';

const outline = franceRings.map(ring => ring.map(([lng, lat], index) =>
  `${index ? 'L' : 'M'}${projectCoordinates(lng, lat).join(',')}`
).join(' ') + ' Z').join(' ');

export default function FranceMap({ circles, selectedId, onSelect, label }) {
  const located = circles.filter(hasMapCoordinates);
  const selected = circles.find(circle => circle.id === selectedId);
  return <div className="Carte">
    <div className="mapHeading"><span>FRANCE MÉTROPOLITAINE</span><p>Un cercle près de chez vous.</p></div>
    <p className="mapInstructions">Sélectionnez un blason pour choisir votre CAL dans le formulaire.</p>
    <div className="franceMap" role="group" aria-label={label || 'Carte des cercles en France'}>
      <svg viewBox="0 0 600 600" aria-hidden="true" focusable="false">
        <path className="franceOutline" d={outline} />
      </svg>
      {located.map(circle => {
        const [x, y] = projectCoordinates(circle.longitude, circle.latitude);
        return <button className={`mapMarker ${selectedId === circle.id ? 'isSelected' : ''}`}
          key={circle.id} type="button" style={{ left: `${x / 6}%`, top: `${y / 6}%` }}
          aria-label={`Choisir ${circle.nom}${circle.ville ? ` — ${circle.ville}` : ''}`}
          aria-pressed={selectedId === circle.id} aria-controls="cal" onClick={() => onSelect(circle.id)}>
          {circle.logo?.url ? (
            <img
              src={getOptimizedImageUrl(circle.logo.url, { width: 64, height: 64, quality: 75, fit: 'crop' })}
              alt=""
              loading="lazy"
              decoding="async"
              width="32"
              height="32"
              onError={event => { event.currentTarget.hidden = true; }}
            />
          ) : null}
          <span className="markerFallback" aria-hidden="true">⚜</span>
          <span className="markerLabel">{circle.ville || circle.nom}</span>
        </button>;
      })}
    </div>
    {located.length === 0 && <p className="mapEmpty">Les implantations seront affichées prochainement.</p>}
    <p className="mapSelection" role="status">{selected ? `Cercle sélectionné : ${selected.nom}` : 'Choisissez votre cercle sur la carte ou dans le formulaire.'}</p>
    {circles.length > 0 && <div className="mapCircleList" aria-label="Liste des cercles">
      {circles.map(circle => <button key={circle.id} type="button" aria-pressed={selectedId === circle.id}
        aria-controls="cal" onClick={() => onSelect(circle.id)}>{circle.ville || circle.nom}</button>)}
    </div>}
  </div>;
}
