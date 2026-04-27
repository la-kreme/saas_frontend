import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { searchBrunchPlaces, type BrunchPlaceSearch, apiFetchAuth } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

interface LinkRestaurantProps {
  onLinked: () => void;
  hideHeader?: boolean;
}

export function LinkRestaurant({ onLinked, hideHeader }: LinkRestaurantProps) {
  const { user } = useAuth();
  
  // Search state
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<BrunchPlaceSearch[]>([]);
  const [selected, setSelected] = useState<BrunchPlaceSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();

  // Read intent payload from URL
  useEffect(() => {
    const intent = searchParams.get('intent');
    const brunchId = searchParams.get('brunch_id');
    const brunchName = searchParams.get('brunch_name');

    if (intent === 'claim' && brunchId && brunchName) {
      const selectedPlace: BrunchPlaceSearch = {
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

  useEffect(() => {
    if (debouncedQuery.length < 3) { setResults([]); return; }
    if (selected) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    searchBrunchPlaces(debouncedQuery)
      .then(data => { if (!cancelled) setResults(data); })
      .catch(() => { if (!cancelled) setError('Impossible de rechercher pour le moment. Réessayez.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, selected]);

  const handleSelect = (place: BrunchPlaceSearch) => {
    setSelected(place);
    setResults([]);
    setQuery(place.name);
  };

  const linkPlace = async (place: BrunchPlaceSearch) => {
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
      onLinked();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr?.status === 409) {
        onLinked();
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

  return (
    <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      {!hideHeader && (
        <div className="onboarding-step-header" style={{ textAlign: 'left' }}>
          <h1 className="onboarding-step-title" style={{ fontSize: '20px' }}>Associer votre restaurant</h1>
          <p className="onboarding-step-desc">
            Recherchez votre établissement sur Koulis pour lier votre compte. C'est votre identifiant unique sur toute la plateforme.
          </p>
        </div>
      )}

      <div className="animate-fade-in" style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Nom de votre restaurant</label>
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
                Veuillez contacter le support pour l'ajouter à l'annuaire.
              </p>
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <button
              id="btn-step1-next"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={!selected || linking}
              onClick={handleConfirmSearch}
            >
              {linking ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Liaison...</> : 'Associer cet établissement'}
            </button>
          </div>
        </div>
    </div>
  );
}
