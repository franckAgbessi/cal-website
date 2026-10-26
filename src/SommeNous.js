import { useEffect, useState } from 'react';
import { client } from './SanityConnect';
import './App.scss';

const query = `*[_type == "sommeNous"] | order(_updatedAt desc)[0] {
    surtitre,
    titre,
    titreItalique,
    description,
    descriptionSecondaire,
    bouton {
        texte,
        lien
    }
}`;

function SommeNous() {
    const [contenu, setContenu] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        let actif = true;

        client.fetch(query)
            .then((data) => {
                if (actif) setContenu(data);
            })
            .catch((error) => {
                console.error('Erreur Sanity :', error);

                if (actif) {
                    setErreur('Impossible de charger cette section.');
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
        <section className="SommeNous" id="qui-sommes-nous">
            {chargement && (
                <p role="status">Chargement…</p>
            )}

            {erreur && (
                <p role="alert">{erreur}</p>
            )}

            {!chargement && !erreur && !contenu && (
                <p>Publie le document « Qui sommes-nous ? » dans Sanity Studio.</p>
            )}

            {contenu && (
                <>
                    <p className="surtitre">
                        {contenu.surtitre}
                    </p>

                    <h2 className="titre">
                        <span style={{ whiteSpace: 'pre-line' }}>
                            {contenu.titre}
                        </span>

                        {contenu.titreItalique && (
                            <>
                                <br />
                                <em>{contenu.titreItalique}</em>
                            </>
                        )}
                    </h2>

                    <hr className="separateur" />

                    <p className="description">
                        {contenu.description}
                    </p>

                    <p className="description-secondaire">
                        {contenu.descriptionSecondaire}
                    </p>

                    {contenu.bouton?.lien && contenu.bouton?.texte && (
                        <a
                            className="bouton"
                            href={contenu.bouton.lien}
                        >
                            {contenu.bouton.texte}
                            {' '}
                            <span aria-hidden="true">↘</span>
                        </a>
                    )}
                </>
            )}
        </section>
    );
}

export default SommeNous;