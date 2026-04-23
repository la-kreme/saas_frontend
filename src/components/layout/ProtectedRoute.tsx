import { Navigate, Outlet } from 'react-router-dom';
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
    // Full page load pour sortir du SPA et atteindre Next.js /login
    const loginUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000/login'
      : '/login';
    window.location.href = loginUrl;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return <Outlet />;
}
