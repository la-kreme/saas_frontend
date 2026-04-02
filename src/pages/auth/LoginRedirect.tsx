import { useEffect } from 'react';

/**
 * En production (app.lakreme.fr) : redirige vers lakreme.fr/auth/login
 * Le cookie Supabase est partagé via .lakreme.fr.
 *
 * En local (localhost:5173) : redirige vers l'Angular (localhost:4200)
 * Le cookie Supabase est partagé sur le domaine localhost (cross-port).
 */
export default function LoginRedirect() {
  useEffect(() => {
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const mainAppUrl = isLocalhost ? 'http://localhost:4200' : 'https://lakreme.fr';
    
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
