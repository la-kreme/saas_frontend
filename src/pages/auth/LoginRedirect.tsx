import { useEffect } from 'react';

/**
 * Redirige vers la page login Next.js (koulis.app/login).
 *
 * Full page load pour sortir du SPA et atteindre Next.js.
 *
 * Mapping des environnements :
 * - localhost:5173  → localhost:3000/login (Next.js dev)
 * - staging/prod    → /login (même domaine, Next.js gère)
 */
export default function LoginRedirect() {
  useEffect(() => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
      // En dev, le SPA tourne sur :5173, Next.js sur :3000
      window.location.href = 'http://localhost:3000/login';
    } else {
      // En prod/staging, Next.js est devant sur le même domaine
      window.location.href = '/login';
    }
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
