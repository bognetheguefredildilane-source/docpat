import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

// Page technique : Google renvoie le visiteur ici, Clerk termine la connexion,
// puis redirige vers /connexion/suite.
export default function SsoCallbackPage() {
  return (
    <>
      <AuthenticateWithRedirectCallback />
      {/* Requis pour la protection anti-robots de Clerk lors d'une première inscription */}
      <div id="clerk-captcha" />
    </>
  );
}