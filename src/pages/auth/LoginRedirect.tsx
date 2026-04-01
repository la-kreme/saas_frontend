import { useEffect } from 'react';

/**
 * Redirige vers la page de login de lakreme.fr.
 * Le cookie Supabase est partagé sur .lakreme.fr — après login là-bas,
 * l'utilisateur revient ici automatiquement authentifié.
 */
export default function LoginRedirect() {
  useEffect(() => {
    const returnUrl = encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = `https://lakreme.fr/auth/login?redirect=${returnUrl}`;
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
