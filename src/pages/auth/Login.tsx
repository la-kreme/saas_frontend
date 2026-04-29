import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

/** Nettoie les cookies Supabase stale pour eviter "Request Header Too Large" */
function clearStaleCookies() {
  const projects = ['xkafeggvxswmtogparae', 'kjlqlpjtiearauugzdnp'];
  const suffixes = ['auth-token', 'auth-token-code-verifier'];
  const domains = ['', '.koulis.app', '.lakreme.fr'];
  for (const proj of projects) {
    for (const suf of suffixes) {
      const key = `sb-${proj}-${suf}`;
      for (const domain of domains) {
        const domainStr = domain ? `; domain=${domain}` : '';
        document.cookie = `${key}=; path=/${domainStr}; max-age=0; SameSite=Lax`;
        for (let i = 0; i < 10; i++) {
          document.cookie = `${key}.${i}=; path=/${domainStr}; max-age=0; SameSite=Lax`;
        }
      }
    }
  }
}

export default function Login() {
  const { user, loading } = useAuth();

  // Nettoyer les cookies stale au montage si on arrive sur /login
  useEffect(() => { clearStaleCookies(); }, []);
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choice' | 'email'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Si deja connecte, redirige
  if (!loading && user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleGoogle = async () => {
    setError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setAuthLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('');
        setMode('choice');
        alert('Un email de confirmation vous a ete envoye.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lk-login-page">
        <Loader2 size={24} className="lk-spinner" />
      </div>
    );
  }

  return (
    <div className="lk-login-page">
      <div className="lk-login-card">
        <div className="lk-login-logo">
          <img src="/logo.png" alt="Le Koulis" className="lk-login-logo-img" />
        </div>

        <h1 className="lk-login-title">
          {isSignUp ? 'Creer un compte' : 'Connexion'}
        </h1>
        <p className="lk-login-subtitle">
          {isSignUp
            ? 'Rejoignez Le Koulis pour gerer vos reservations.'
            : 'Accedez a votre espace restaurateur.'}
        </p>

        {error && <div className="lk-login-error">{error}</div>}

        {mode === 'choice' ? (
          <div className="lk-login-choices">
            <button
              className="lk-login-google-btn"
              onClick={handleGoogle}
              disabled={authLoading}
            >
              <GoogleIcon />
              {authLoading ? 'Connexion...' : 'Continuer avec Google'}
            </button>

            <div className="lk-login-divider">
              <span>ou</span>
            </div>

            <button
              className="lk-login-email-btn"
              onClick={() => setMode('email')}
            >
              <Mail size={16} />
              Continuer avec un email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmail} className="lk-login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                required
                autoFocus
                placeholder="vous@restaurant.fr"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                className="form-input"
                type="password"
                required
                minLength={6}
                placeholder="6 caracteres minimum"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="lk-login-submit-btn"
              disabled={authLoading}
            >
              {authLoading ? <Loader2 size={16} className="lk-spinner" /> : null}
              {isSignUp ? 'Creer mon compte' : 'Se connecter'}
            </button>
            <button
              type="button"
              className="lk-login-back-btn"
              onClick={() => { setMode('choice'); setError(''); }}
            >
              Retour
            </button>
          </form>
        )}

        <div className="lk-login-toggle">
          {isSignUp ? (
            <>Deja un compte ? <button onClick={() => { setIsSignUp(false); setError(''); }}>Se connecter</button></>
          ) : (
            <>Pas encore de compte ? <button onClick={() => { setIsSignUp(true); setError(''); }}>Creer un compte</button></>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
