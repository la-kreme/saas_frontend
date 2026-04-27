import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Loader2, Building, ArrowLeft } from 'lucide-react';
import { searchRestaurants, createRestaurant, type RestaurantSearch, apiFetchAuth } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Step 1 — Liaison à la fiche restaurant + Fallback Création
 * Le restaurateur recherche sa fiche ou la crée si elle n'existe pas.
 */
export default function Step1Link() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'search' | 'create'>('search');
  
  // Search state
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<RestaurantSearch[]>([]);
  const [selected, setSelected] = useState<RestaurantSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  // Create state
  const [createForm, setCreateForm] = useState({ name: '', address: '', city_name: '', phone: '' });

  const [searchParams] = useSearchParams();

  // Read intent payload from URL
  useEffect(() => {
    const intent = searchParams.get('intent');
    const brunchId = searchParams.get('brunch_id');
    const brunchName = searchParams.get('brunch_name');

    if (intent === 'claim' && brunchId && brunchName) {
      // Pre-fill the search with the known entity
      const selectedPlace: RestaurantSearch = {
        id: brunchId,
        name: brunchName,
        address: '', // not strictly strictly needed for locking as backend has it
        city_name: '',
        slug: '',
      };
      setSelected(selectedPlace);
      setQuery(brunchName);
    }
  }, [searchParams]);

  // Debounced search — only fires when debouncedQuery changes (300ms after last keystroke)
  useEffect(() => {
    if (debouncedQuery.length < 3) { setResults([]); return; }
    if (selected) return; // Don't search if already selected

    let cancelled = false;
    setLoading(true);
    setError('');

    searchRestaurants(debouncedQuery)
      .then(data => { if (!cancelled) setResults(data); })
      .catch(() => { if (!cancelled) setError('Impossible de rechercher pour le moment. Réessayez.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, selected]);

  const handleSelect = (place: RestaurantSearch) => {
    setSelected(place);
    setResults([]);
    setQuery(place.name);
  };

  const linkPlace = async (place: RestaurantSearch) => {
    setLinking(true);
    setError('');
    try {
      await apiFetchAuth('/api/v1/restaurant/me/link', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: place.id,
          restaurant_name: place.name,
          restaurant_address: place.address,
          restaurant_city: place.city_name,
          notification_email: user?.email ?? '',
        }),
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr?.status === 409) {
        // Already linked — advance anyway
        navigate('/dashboard');
      } else {
        setError(apiErr?.message ?? "Impossible de lier votre fiche. Vérifiez votre connexion.");
      }
    } finally {
      setLinking(false);
    }
  };

  const handleConfirmSearch = () => {
    if (!selected) return;
    linkPlace(selected);
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.city_name) {
      setError("Le nom et la ville sont obligatoires.");
      return;
    }
    setLinking(true);
    setError('');
    try {
      const newPlace = await createRestaurant(createForm);
      // linkPlace handles its own error display and setLinking
      await linkPlace(newPlace);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message ?? "Erreur lors de la création.");
      setLinking(false);
    }
  };

  return (
    <>
      <div className="onboarding-step-header">
        <h1 className="onboarding-step-title">Ma fiche restaurant</h1>
        <p className="onboarding-step-desc">
          {mode === 'search' 
            ? "Recherchez votre établissement sur Koulis pour lier votre compte. C'est votre identifiant unique sur toute la plateforme."
            : "Saisissez les informations de votre établissement pour créer sa fiche sur Koulis."}
        </p>
      </div>

      {mode === 'search' && (
        <div className="animate-fade-in">
          {/* Search input */}
          <div className="form-group">
            <label className="form-label">Nom de votre restaurant</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--lk-text-muted)',
                }}
              />
              <input
                id="restaurant-search"
                className={`form-input ${error ? 'error' : ''}`}
                style={{ paddingLeft: '40px' }}
                placeholder="Ex: Le Café des Amis, Paris..."
                value={query}
                onChange={e => { setQuery(e.target.value); setError(''); }}
                autoFocus
              />
              {loading && (
                <Loader2
                  size={16}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--lk-text-muted)',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>

          {/* Results dropdown */}
          {results.length > 0 && (
            <div style={{
              marginTop: '8px',
              background: 'var(--lk-surface-2)',
              border: '1px solid var(--lk-border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              {results.map(place => (
                <button
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--lk-border)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--lk-surface-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <MapPin size={14} style={{ color: 'var(--lk-purple-light)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--lk-text-primary)' }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--lk-text-muted)' }}>
                      {place.address} · {place.city_name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected confirmation */}
          {selected && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: 'var(--lk-success-muted)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
              className="animate-slide-up"
            >
              <CheckCircle2 size={18} style={{ color: 'var(--lk-success)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--lk-text-primary)' }}>
                  {selected.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--lk-text-secondary)', marginTop: '2px' }}>
                  {selected.address} · {selected.city_name}
                </div>
                <button
                  className="text-xs text-muted"
                  style={{ marginTop: '8px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => { setSelected(null); setQuery(''); }}
                >
                  Ce n'est pas mon établissement
                </button>
              </div>
            </div>
          )}

          {!selected && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <p style={{ color: 'var(--lk-text-muted)', fontSize: '14px', marginBottom: '12px' }}>
                Vous ne trouvez pas votre établissement ?
              </p>
              <button
                className="btn"
                style={{ background: 'var(--lk-surface-2)', border: '1px solid var(--lk-border)' }}
                onClick={() => { setMode('create'); setCreateForm(f => ({...f, name: query })); setError(''); }}
              >
                <Building size={16} /> Créer mon établissement
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="onboarding-actions">
            <button
              id="btn-step1-next"
              className="btn btn-primary btn-lg"
              disabled={!selected || linking}
              onClick={handleConfirmSearch}
            >
              {linking ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Liaison...</> : 'Continuer →'}
            </button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleConfirmCreate} className="animate-fade-in">
          <button 
            type="button"
            className="btn"
            style={{ padding: '6px 12px', marginBottom: '24px', background: 'transparent', border: '1px solid var(--lk-border)' }}
            onClick={() => { setMode('search'); setError(''); }}
          >
            <ArrowLeft size={16} /> Retour à la recherche
          </button>

          {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Nom de l'établissement *</label>
            <input 
              required
              className="form-input" 
              value={createForm.name} 
              onChange={e => setCreateForm({...createForm, name: e.target.value})} 
              placeholder="Le Café des Amis"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ville *</label>
            <input 
              required
              className="form-input" 
              value={createForm.city_name} 
              onChange={e => setCreateForm({...createForm, city_name: e.target.value})} 
              placeholder="Paris"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse postale</label>
            <input 
              className="form-input" 
              value={createForm.address} 
              onChange={e => setCreateForm({...createForm, address: e.target.value})} 
              placeholder="12 rue de la Paix"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Numéro de téléphone</label>
            <input 
              type="tel"
              className="form-input" 
              value={createForm.phone} 
              onChange={e => setCreateForm({...createForm, phone: e.target.value})} 
              placeholder="01 23 45 67 89"
            />
          </div>

          <div className="onboarding-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={linking || !createForm.name || !createForm.city_name}
            >
              {linking ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Création...</> : 'Créer et Continuer →'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
