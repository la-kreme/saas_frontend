import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute : redirige vers /login si l'utilisateur n'est pas connecté.
 * Affiche un spinner pendant la vérification de session.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    // Cross-domain redirect vers koulis.ai/login (Next.js)
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
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return <Outlet />;
}
