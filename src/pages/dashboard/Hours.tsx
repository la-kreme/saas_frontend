import { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Loader2, Save, Lock, Repeat } from 'lucide-react';
import { getMyHours, createHour, updateHour, deleteHour, getErrorMessage } from '../../lib/api';
import { PageHeader, Card, Button } from '../../components/ui';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface EditableService {
  id?: string;
  tempId: string;
  open_time: string;
  close_time: string;
  slot_duration_min: number;
  slot_interval_min: number;
  service_name: string;
}

interface DayConfig {
  enabled: boolean;
  services: EditableService[];
}

const makeService = (): EditableService => ({
  tempId: crypto.randomUUID(),
  open_time: '10:00',
  close_time: '14:30',
  slot_duration_min: 90,
  slot_interval_min: 30,
  service_name: '',
});

const defaultDays = (): DayConfig[] =>
  DAYS.map(() => ({ enabled: false, services: [makeService()] }));

export default function Hours() {
  const [days, setDays] = useState<DayConfig[]>(defaultDays());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeDay, setActiveDay] = useState(5); // Samedi par defaut
  const [originalDays, setOriginalDays] = useState<DayConfig[]>(defaultDays());
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => { loadHours(); }, []);

  const loadHours = async () => {
    try {
      setLoading(true);
      const data = await getMyHours();
      const newDays = defaultDays();
      for (const h of data) {
        if (!newDays[h.day_of_week].enabled) {
          newDays[h.day_of_week].enabled = true;
          newDays[h.day_of_week].services = [];
        }
        newDays[h.day_of_week].services.push({
          id: h.id,
          tempId: crypto.randomUUID(),
          open_time: h.open_time,
          close_time: h.close_time,
          slot_duration_min: h.slot_duration_min,
          slot_interval_min: h.slot_interval_min,
          service_name: h.service_name,
        });
      }
      setDays(newDays);
      setOriginalDays(JSON.parse(JSON.stringify(newDays)));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Impossible de charger les horaires'));
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const willBeDisabled = d.enabled;
      if (willBeDisabled) {
        // Desactiver : marquer les services existants pour suppression
        d.services.forEach(s => {
          if (s.id) setDeletedIds(prevIds => [...prevIds, s.id!]);
        });
        return { ...d, enabled: false, services: [makeService()] };
      } else {
        // Reactiver : restaurer les services originaux et retirer des deletedIds
        const orig = originalDays[dayIdx];
        if (orig.enabled && orig.services.length > 0) {
          const origIds = orig.services.map(s => s.id).filter(Boolean) as string[];
          setDeletedIds(prevIds => prevIds.filter(id => !origIds.includes(id)));
          return { ...d, enabled: true, services: JSON.parse(JSON.stringify(orig.services)) };
        }
        return { ...d, enabled: true };
      }
    }));
    setSuccess('');
  };

  const updateService = (dayIdx: number, svcIdx: number, field: keyof EditableService, value: string | number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      return { ...d, services: d.services.map((s, si) => si !== svcIdx ? s : { ...s, [field]: value }) };
    }));
    setSuccess('');
  };

  const addService = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) => i !== dayIdx ? d : { ...d, services: [...d.services, makeService()] }));
    setSuccess('');
  };

  const removeService = (dayIdx: number, svcIdx: number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const svc = d.services[svcIdx];
      if (svc.id) setDeletedIds(prevIds => [...prevIds, svc.id!]);
      return { ...d, services: d.services.filter((_, si) => si !== svcIdx) };
    }));
    setSuccess('');
  };

  const copyToAll = (dayIdx: number) => {
    const source = days[dayIdx];
    setDays(prev => prev.map((d, i) => {
      if (i === dayIdx || !d.enabled) return d;
      d.services.forEach(s => {
        if (s.id) setDeletedIds(prevIds => [...prevIds, s.id!]);
      });
      const copiedServices = JSON.parse(JSON.stringify(source.services)).map((s: EditableService) => ({
        ...s, id: undefined, tempId: crypto.randomUUID(),
      }));
      return { ...d, services: copiedServices };
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      for (const id of deletedIds) await deleteHour(id);
      for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
        const d = days[dayIdx];
        if (!d.enabled) continue;
        for (const s of d.services) {
          const payload = {
            day_of_week: dayIdx, open_time: s.open_time, close_time: s.close_time,
            slot_duration_min: s.slot_duration_min, slot_interval_min: s.slot_interval_min,
            service_name: s.service_name,
          };
          if (!s.id) {
            await createHour(payload);
          } else {
            const origDay = originalDays[dayIdx];
            const origSvc = origDay.enabled ? origDay.services.find(os => os.id === s.id) : null;
            if (origSvc && (
              origSvc.open_time !== s.open_time || origSvc.close_time !== s.close_time ||
              origSvc.slot_duration_min !== s.slot_duration_min ||
              origSvc.slot_interval_min !== s.slot_interval_min ||
              origSvc.service_name !== s.service_name
            )) {
              await updateHour(s.id, payload);
            }
          }
        }
      }
      setDeletedIds([]);
      await loadHours();
      setSuccess('Horaires enregistres avec succes');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors de la sauvegarde'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lk-loading-center--fullpage">
        <Loader2 size={24} className="lk-spinner" />
      </div>
    );
  }

  const isValid = days.some(d => d.enabled && d.services.length > 0);
  const hasChanges = deletedIds.length > 0 || JSON.stringify(days) !== JSON.stringify(originalDays);
  const dayConfig = days[activeDay];

  return (
    <div className="lk-animate-up lk-page-container">
      <PageHeader
        title="Horaires d'ouverture"
        subtitle="Definissez quand vos clients peuvent reserver."
        right={
          <div className="lk-actions-row">
            <Button variant="secondary" size="md" icon={<Repeat size={14} strokeWidth={2} />} onClick={() => copyToAll(activeDay)} disabled={!dayConfig.enabled}>
              Copier vers...
            </Button>
            <Button variant="primary" size="md" icon={saving ? <Loader2 size={14} className="lk-spinner" /> : <Save size={14} />} onClick={handleSave} disabled={!isValid || !hasChanges || saving}>
              Enregistrer
            </Button>
          </div>
        }
      />

      {error && <p className="form-error lk-margin-y-sm">{error}</p>}
      {success && <p className="lk-text-success lk-margin-y-sm">{success}</p>}

      {/* Main layout — order controlled via CSS for mobile */}
      <div className="lk-hours-layout">
        {/* Week preview — order -1 in mobile to be on top */}
        <Card padded={false} className="lk-hours-preview-card">
          <div className="lk-hours-preview-title">
            Apercu de la semaine
          </div>
          <p className="lk-hours-preview-desc">
            Chaque bloc represente un service.
          </p>
          {DAYS.map((d, i) => {
            const cfg = days[i];
            return (
              <div key={d} className="lk-hours-preview-row">
                <div className="lk-hours-preview-day-label">
                  {d.slice(0, 3)}
                </div>
                <div className="lk-hours-preview-bar">
                  {cfg.enabled && cfg.services.map((s, si) => {
                    const start = timeToFrac(s.open_time);
                    const end = timeToFrac(s.close_time);
                    return (
                      <div
                        key={si}
                        className="lk-hours-preview-block"
                        style={{
                          left: `${start * 100}%`,
                          width: `${(end - start) * 100}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Week strip */}
        <Card padded={false} className="lk-hours-week-strip">
          <div className="lk-hours-week-grid">
            {DAYS.map((dayName, i) => {
              const d = days[i];
              const isActive = i === activeDay;
              return (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`lk-hours-day-btn ${isActive ? 'lk-hours-day-btn--active' : 'lk-hours-day-btn--inactive'} ${i < 6 ? 'lk-hours-day-border-right' : ''}`}
                >
                  <div className={`lk-hours-day-label ${isActive ? 'lk-hours-day-label--active' : 'lk-hours-day-label--inactive'}`}>
                    {dayName.slice(0, 3)}
                  </div>
                  {d.enabled ? (
                    <>
                      <div className="lk-hours-day-count">
                        <span className="lk-hours-day-count-full">{d.services.length} service{d.services.length > 1 ? 's' : ''}</span>
                        <span className="lk-hours-day-count-short">{d.services.length}</span>
                      </div>
                      <div className="lk-hours-day-times">
                        {d.services[0]?.open_time}–{d.services[d.services.length - 1]?.close_time}
                      </div>
                    </>
                  ) : (
                    <div className="lk-hours-day-closed">
                      <span className="lk-hours-day-closed-icon"><Lock size={11} strokeWidth={2} /></span>
                      <span className="lk-hours-day-closed-text"> Ferme</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Day editor */}
        <Card padded={false} className="lk-hours-editor-card">
          <div className="lk-hours-editor-header">
            <div className="lk-hours-editor-header-left">
              <h2 className="lk-hours-editor-day-title">
                {DAYS[activeDay]}
              </h2>
              <label className="toggle">
                <input type="checkbox" checked={dayConfig.enabled} onChange={() => toggleDay(activeDay)} />
                <span className="toggle-slider" />
              </label>
              <span className="lk-hours-editor-status">
                {dayConfig.enabled ? 'Ouvert' : 'Ferme'}
              </span>
            </div>
            {dayConfig.enabled && (
              <button
                onClick={() => copyToAll(activeDay)}
                className="lk-hours-copy-btn"
              >
                <Copy size={12} /> Copier vers...
              </button>
            )}
          </div>

          {dayConfig.enabled && dayConfig.services.map((svc, svcIdx) => (
            <ServiceEditor
              key={svc.tempId}
              svc={svc}
              showBorder={svcIdx > 0}
              canDelete={dayConfig.services.length > 1}
              onUpdate={(field, value) => updateService(activeDay, svcIdx, field, value)}
              onDelete={() => removeService(activeDay, svcIdx)}
            />
          ))}

          {dayConfig.enabled && (
            <div className="lk-hours-add-service-wrap">
              <button
                onClick={() => addService(activeDay)}
                className="lk-hours-add-service-btn"
              >
                <Plus size={13} strokeWidth={2.4} /> Ajouter un service
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ServiceEditor({ svc, showBorder, canDelete, onUpdate, onDelete }: {
  svc: EditableService; showBorder: boolean; canDelete: boolean;
  onUpdate: (field: keyof EditableService, value: string | number) => void;
  onDelete: () => void;
}) {
  return (
    <div className={`lk-hours-svc-editor ${showBorder ? 'lk-hours-svc-editor--bordered' : ''}`}>
      <div className="lk-hours-svc-header">
        <input
          value={svc.service_name}
          onChange={e => onUpdate('service_name', e.target.value)}
          placeholder="Nom du service"
          className="lk-hours-svc-name-input"
        />
        {canDelete && (
          <button
            onClick={onDelete}
            className="lk-hours-svc-delete-btn"
          >
            <Trash2 size={12} /> Supprimer
          </button>
        )}
      </div>

      <div className="lk-hours-svc-fields">
        <FieldLabel label="Ouverture">
          <input type="time" value={svc.open_time} onChange={e => onUpdate('open_time', e.target.value)} className="lk-hours-input" />
        </FieldLabel>
        <FieldLabel label="Fermeture">
          <input type="time" value={svc.close_time} onChange={e => onUpdate('close_time', e.target.value)} className="lk-hours-input" />
        </FieldLabel>
        <FieldLabel label="Duree repas">
          <select value={svc.slot_duration_min} onChange={e => onUpdate('slot_duration_min', +e.target.value)} className="lk-hours-input">
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Intervalle">
          <select value={svc.slot_interval_min} onChange={e => onUpdate('slot_interval_min', +e.target.value)} className="lk-hours-input">
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
        </FieldLabel>
      </div>

      {/* Visual hour bar */}
      <HourBar from={svc.open_time} to={svc.close_time} />
    </div>
  );
}

function HourBar({ from, to }: { from: string; to: string }) {
  const startFrac = timeToFrac(from);
  const endFrac = timeToFrac(to);
  return (
    <div className="lk-hours-bar">
      {Array.from({ length: 24 }).map((_, h) => (
        <div key={h} className="lk-hours-bar-tick" style={{ left: `${(h / 24) * 100}%` }} />
      ))}
      <div
        className="lk-hours-bar-fill"
        style={{
          left: `${startFrac * 100}%`,
          width: `${(endFrac - startFrac) * 100}%`,
        }}
      >
        {from}–{to}
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="lk-field-label">
      <span className="lk-field-label-text">
        {label}
      </span>
      {children}
    </label>
  );
}

function timeToFrac(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h + m / 60) / 24;
}
