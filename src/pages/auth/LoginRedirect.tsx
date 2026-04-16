import { useEffect } from 'react';

/**
 * Redirige vers le frontend Angular pour le login OAuth.
 *
 * Mapping des environnements :
 * - localhost:5173  → localhost:4200 (dev)
 * - staging.koulis.app → staging.lakreme.fr (staging)
 * - koulis.app → lakreme.fr (prod)
 *
 * Le callback Angular passera la session via token-in-URL (hash fragment)
 * car .lakreme.fr et .koulis.app sont des TLDs différents — les cookies
 * ne peuvent pas être partagés directement.
 */
export default function LoginRedirect() {
  useEffect(() => {
    const hostname = window.location.hostname;

    let mainAppUrl: string;
    if (hostname === 'localhost') {
      mainAppUrl = 'http://localhost:4200';
    } else if (hostname === 'staging.koulis.app') {
      mainAppUrl = 'https://staging.lakreme.fr';
    } else {
      // Production: koulis.app → lakreme.fr
      mainAppUrl = 'https://lakreme.fr';
    }

    const returnUrl = encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = `${mainAppUrl}/auth/login?redirect=${returnUrl}`;
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <div className="spinner" />
      <p className="text-sm text-muted">Redirection vers la connexion principale...</p>
    </div>
  );
}
