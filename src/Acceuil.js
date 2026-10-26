import { useEffect, useState } from 'react';
import { client } from './SanityConnect';
import './App.scss';
import HeroImage from './Image/hero.jpg';

const query = `*[_type == "accueil"] | order(_updatedAt desc)[0] {
    surtitre,
    titre,
    description,
    "image": {
        "url": image.asset->url,
        "alt": image.alt
    },
    "logo": {
        "url": logo.asset->url,
        "alt": logo.alt
    },
    boutonPrincipal,
    boutonSecondaire
}`;

function Acceuil() {
    const [accueil, setAccueil] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        let actif = true;

        client.fetch(query)
            .then((data) => {
                if (actif) setAccueil(data);
            })
            .catch((error) => {
                console.error('Erreur Sanity :', error);

                if (actif) {
                    setErreur("Impossible de charger la page d’accueil.");
                }
            })
            .finally(() => {
                if (actif) setChargement(false);
            });

        return () => {
            actif = false;
        };
    }, []);

    return (
        <div className="Acceuil">
            <div className="image">


                <div className="Element">

                    {accueil && (
                        <>
                            {accueil.logo?.url && (
                                <img
                                    className="logo"
                                    src={accueil.logo.url}
                                    alt={accueil.logo.alt || ''}
                                />
                            )}

                            {accueil.surtitre && (
                                <p className="surtitre">
                                    <span className='line'> </span>
                                    {accueil.surtitre}
                                </p>
                            )}

                            <h1 className="titre">
                                {accueil.titre}
                            </h1>

                            <p className="description">
                                {accueil.description}

                            </p>

                            <div className="boutons">
                                {accueil.boutonPrincipal?.lien &&
                                    accueil.boutonPrincipal?.texte && (
                                        <a
                                            className="bouton bouton-principal"
                                            href={accueil.boutonPrincipal.lien}
                                        >
                                            {accueil.boutonPrincipal.texte}
                                            <span>↓</span>
                                        </a>
                                    )}

                                {accueil.boutonSecondaire?.lien &&
                                    accueil.boutonSecondaire?.texte && (
                                        <a
                                            className="bouton bouton-secondaire"
                                            href={accueil.boutonSecondaire.lien}
                                        >
                                            {accueil.boutonSecondaire.texte}
                                            <span>↗</span>
                                        </a>
                                    )}
                            </div>
                        </>
                    )}
                </div>

                <div
                    className="hero-image"
                    style={{
                        backgroundImage: `url("${accueil?.image?.url || HeroImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '100%',
                    }}
                ></div>
            </div>
        </div >
    );
}

export default Acceuil;