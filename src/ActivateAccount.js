import { useState } from 'react';
import { clearInviteHash, getInviteSession, setInitialPassword } from './calApi';

export default function ActivateAccount() {
  const [inviteSession] = useState(getInviteSession());
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const activate = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = inviteSession?.email || data.get('email');
    const password = data.get('password');
    const confirmation = data.get('passwordConfirmation');

    if (!email) return setError('Veuillez renseigner votre email.');
    if (password !== confirmation) return setError('Les deux mots de passe sont différents.');
    if (password.length < 6) return setError('Choisissez un mot de passe d’au moins 6 caractères.');

    setError('');
    setSending(true);
    try {
      await setInitialPassword({ email }, password);
      clearInviteHash();
      window.location.assign('/cal');
    } catch (nextError) {
      setSending(false);
      setError(nextError.message || 'Une erreur est survenue.');
    }
  };

  return <main className="calGazette activationPage">
    <a className="gazetteBack" href="/">← Retour au site</a>
    <header className="gazetteMasthead">
      <p>ESPACE MEMBRE · GAZETTE DES CAL</p>
      <h1>Bienvenue<br /><em>à bord</em></h1>
      <span>Activez votre accès membre en quelques instants.</span>
    </header>
    <section className="gazetteGate" aria-labelledby="activation-title">
      <div>
        <p className="gazetteKicker">ACTIVATION DU COMPTE</p>
        <h2 id="activation-title">Définissez votre mot de passe.</h2>
        <p>Une fois configuré dans Sanity, vous accéderez directement à la Gazette.</p>
      </div>
      <form onSubmit={activate} className="loginForm">
        {!inviteSession?.email && (
          <>
            <label htmlFor="activation-email">Email</label>
            <input id="activation-email" name="email" type="email" required />
          </>
        )}
        <label htmlFor="activation-password">Nouveau mot de passe</label>
        <input id="activation-password" name="password" type="password" autoComplete="new-password" minLength="6" required autoFocus />
        <label htmlFor="activation-password-confirmation">Confirmer le mot de passe</label>
        <input id="activation-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength="6" required />
        {error && <p className="formError" role="alert">{error}</p>}
        <button type="submit" disabled={sending}>{sending ? 'Enregistrement…' : 'Activer mon compte'} <span>→</span></button>
      </form>
    </section>
  </main>;
}
