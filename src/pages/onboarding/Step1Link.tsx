import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { searchBrunchPlaces, type BrunchPlaceSearch } from '../../lib/api';

/**
 * Step 1 — Liaison à la fiche restaurant
 * Le restaurateur recherche et sélectionne sa fiche lakreme.fr
 * widgetConfig est créée en DB (is_active=false) à la validation.
 */
export default function Step1Link() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BrunchPlaceSearch[]>([]);
  const [selected, setSelected] = useState<BrunchPlaceSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    setError('');
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchBrunchPlaces(q);
      setResults(data);
    } catch {
      setError('Impossible de rechercher pour le moment. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (place: BrunchPlaceSearch) => {
    setSelected(place);
    setResults([]);
    setQuery(place.name);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setLinking(true);
    setError('');
    try {
      // TODO Sprint 4 : appel POST /api/v1/restaurant/link pour créer widget_config
      // Pour Sprint 1, simuler le succès et sauvegarder en localStorage
      localStorage.setItem('lk_restaurant_id', selected.id);
      localStorage.setItem('lk_restaurant_name', selected.name);
      navigate('/onboarding/tables');
    } catch {
      setError("Impossible de lier votre fiche. Vérifiez votre connexion.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 1 sur 5</div>
        <h1 className="onboarding-step-title">Ma fiche restaurant</h1>
        <p className="onboarding-step-desc">
          Recherchez votre établissement sur La Krème pour lier votre compte.
          C'est votre identifiant unique sur toute la plateforme.
        </p>
      </div>

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
            onChange={e => handleSearch(e.target.value)}
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

      {/* Actions */}
      <div className="onboarding-actions">
        <button
          id="btn-step1-next"
          className="btn btn-primary btn-lg"
          disabled={!selected || linking}
          onClick={handleConfirm}
        >
          {linking ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Liaison...</> : 'Continuer →'}
        </button>
      </div>
    </>
  );
}
