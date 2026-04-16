import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Plus, Trash2, Loader2 } from 'lucide-react';
import { createHour, getErrorMessage } from '../../lib/api';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface DayService {
  open_time: string;
  close_time: string;
  slot_duration_min: number;
  slot_interval_min: number;
  service_name: string;
}

interface DayConfig {
  enabled: boolean;
  services: DayService[];
}

const defaultService = (): DayService => ({
  open_time: '10:00',
  close_time: '14:30',
  slot_duration_min: 90,
  slot_interval_min: 30,
  service_name: '',
});

const defaultDays = (): DayConfig[] =>
  DAYS.map(() => ({ enabled: false, services: [defaultService()] }));

interface Step3Props {
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * Step 3 — Mes horaires
 * Toggle par jour + configuration des services (open/close, duration, interval).
 * Sauvegarde via POST /api/v1/restaurant/me/hours pour chaque service actif.
 */
export default function Step3Hours({ onNext, onBack }: Step3Props = {}) {
  const navigate = useNavigate();
  const [days, setDays] = useState<DayConfig[]>(defaultDays());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, enabled: !d.enabled } : d
    ));
  };

  const updateService = (dayIdx: number, svcIdx: number, field: keyof DayService, value: string | number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      return {
        ...d,
        services: d.services.map((s, si) =>
          si !== svcIdx ? s : { ...s, [field]: value }
        ),
      };
    }));
  };

  const addService = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, services: [...d.services, defaultService()] }
    ));
  };

  const removeService = (dayIdx: number, svcIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, services: d.services.filter((_, si) => si !== svcIdx) }
    ));
  };

  const copyToAll = (dayIdx: number) => {
    const source = days[dayIdx];
    setDays(prev => prev.map((d, i) =>
      i === dayIdx || !d.enabled ? d : { ...d, services: JSON.parse(JSON.stringify(source.services)) }
    ));
  };

  const isValid = days.some(d => d.enabled && d.services.length > 0);

  const handleNext = async () => {
    setSaving(true);
    setError('');
    try {
      const hoursToCreate = days.flatMap((d, dayIdx) =>
        d.enabled ? d.services.map(s => ({ day_of_week: dayIdx, ...s })) : []
      );
      await Promise.all(hoursToCreate.map(h => createHour(h)));
      if (onNext) onNext();
      else navigate('/onboarding/customize');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la sauvegarde des horaires.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 3 sur 5</div>
        <h1 className="onboarding-step-title">Mes horaires</h1>
        <p className="onboarding-step-desc">
          Définissez quand vos clients peuvent réserver.
          Vous pouvez avoir plusieurs services par jour.
        </p>
      </div>

      <div className="flex-col gap-3">
        {DAYS.map((dayName, dayIdx) => (
          <div key={dayIdx} style={{
            background: 'var(--lk-surface-2)',
            border: `1px solid ${days[dayIdx].enabled ? 'rgba(83,52,131,0.35)' : 'var(--lk-border)'}`,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            transition: 'border-color var(--transition)',
          }}>
            {/* Day header */}
            <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
              <div className="flex items-center gap-3">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={days[dayIdx].enabled}
                    onChange={() => toggleDay(dayIdx)}
                    id={`toggle-day-${dayIdx}`}
                  />
                  <span className="toggle-slider" />
                </label>
                <span style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  color: days[dayIdx].enabled ? 'var(--lk-text-primary)' : 'var(--lk-text-muted)',
                }}>
                  {dayName}
                </span>
              </div>
              {days[dayIdx].enabled && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px', gap: '4px' }}
                  onClick={() => copyToAll(dayIdx)}
                  title="Copier ces horaires vers les autres jours actifs"
                >
                  <Copy size={12} /> Copier vers...
                </button>
              )}
            </div>

            {/* Services */}
            {days[dayIdx].enabled && days[dayIdx].services.map((svc, svcIdx) => (
              <div key={svcIdx} style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--lk-border)',
                background: 'var(--lk-dark)',
              }}>
                {/* Service name (optionnel) */}
                <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1, height: '32px', fontSize: '12px' }}
                    placeholder="Nom du service (optionnel : Brunch, Déjeuner...)"
                    value={svc.service_name}
                    onChange={e => updateService(dayIdx, svcIdx, 'service_name', e.target.value)}
                  />
                  {days[dayIdx].services.length > 1 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeService(dayIdx, svcIdx)}
                      style={{ color: 'var(--lk-error)', padding: '0 8px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Time + duration + interval */}
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Ouverture</label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ height: '32px', fontSize: '12px' }}
                      value={svc.open_time}
                      onChange={e => updateService(dayIdx, svcIdx, 'open_time', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Fermeture</label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ height: '32px', fontSize: '12px' }}
                      value={svc.close_time}
                      onChange={e => updateService(dayIdx, svcIdx, 'close_time', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Durée slot</label>
                    <select
                      className="form-input"
                      style={{ height: '32px', fontSize: '12px' }}
                      value={svc.slot_duration_min}
                      onChange={e => updateService(dayIdx, svcIdx, 'slot_duration_min', Number(e.target.value))}
                    >
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Intervalle</label>
                    <select
                      className="form-input"
                      style={{ height: '32px', fontSize: '12px' }}
                      value={svc.slot_interval_min}
                      onChange={e => updateService(dayIdx, svcIdx, 'slot_interval_min', Number(e.target.value))}
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Add service */}
            {days[dayIdx].enabled && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', borderTop: '1px solid var(--lk-border)', borderRadius: 0, height: '36px', fontSize: '12px' }}
                onClick={() => addService(dayIdx)}
              >
                <Plus size={12} /> Ajouter un service
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={() => onBack ? onBack() : navigate('/onboarding/tables')}>
          ← Retour
        </button>
        <button
          id="btn-step3-next"
          className="btn btn-primary btn-lg"
          disabled={!isValid || saving}
          onClick={handleNext}
        >
          {saving
            ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Sauvegarde...</>
            : 'Continuer →'
          }
        </button>
      </div>
    </>
  );
}
