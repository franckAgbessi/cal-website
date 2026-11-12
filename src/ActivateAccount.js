import { useState } from 'react';
import { clearInviteHash, getInviteSession, setInitialPassword } from './calApi';

export default function ActivateAccount() {
  const [inviteSession] = useState(getInviteSession());
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const activate = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = data.get('password');
    if (!inviteSession) return setError('Ce lien d’invitation est incomplet ou a expiré. Demandez une nouvelle invitation à la rédaction.');
    if (password !== data.get('passwordConfirmation')) return setError('Les deux mots de passe sont différents.');
    if (password.length < 12) return setError('Choisissez un mot de passe d’au moins 12 caractères.');
    setError(''); setSending(true);
    try {
      await setInitialPassword(inviteSession, password);
      clearInviteHash();
      window.location.assign('/cal');
    } catch (nextError) {
      setSending(false);
      setError(nextError.message);
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
      <div><p className="gazetteKicker">ACTIVATION DU COMPTE</p><h2 id="activation-title">Choisissez votre mot de passe.</h2><p>Il doit comporter au moins 12 caractères. Une fois créé, vous arriverez directement dans la Gazette.</p></div>
      <form onSubmit={activate} className="loginForm">
        <label htmlFor="activation-password">Nouveau mot de passe</label><input id="activation-password" name="password" type="password" autoComplete="new-password" minLength="12" required autoFocus />
        <label htmlFor="activation-password-confirmation">Confirmer le mot de passe</label><input id="activation-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength="12" required />
        {error && <p className="formError" role="alert">{error}</p>}
        <button type="submit" disabled={sending}>{sending ? 'Activation…' : 'Activer mon compte'} <span>→</span></button>
      </form>
    </section>
  </main>;
}
