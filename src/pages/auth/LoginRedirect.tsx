import { useEffect } from 'react';

/**
 * Redirige vers la page login Next.js (koulis.ai/login).
 *
 * Cross-domain : koulis.app → koulis.ai (TLDs differents).
 *
 * Mapping des environnements :
 * - localhost:5173  → localhost:3000/login (Next.js dev)
 * - staging.koulis.app → staging.koulis.ai
 * - koulis.app → koulis.ai
 */
export default function LoginRedirect() {
  useEffect(() => {
    const hostname = window.location.hostname;

    let loginUrl: string;
    if (hostname === 'localhost') {
      loginUrl = 'http://localhost:3000/login';
    } else if (hostname === 'staging.koulis.app') {
      loginUrl = 'https://staging.koulis.ai/login';
    } else {
      loginUrl = 'https://koulis.ai/login';
    }
    window.location.href = loginUrl;
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
      <p className="text-sm text-muted">Redirection vers la connexion...</p>
    </div>
  );
}
