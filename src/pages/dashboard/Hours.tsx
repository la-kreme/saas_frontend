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
        d.services.forEach(s => {
          if (s.id) setDeletedIds(prevIds => [...prevIds, s.id!]);
        });
      }
      return {
        ...d, enabled: !d.enabled,
        services: willBeDisabled ? [makeService()] : d.services,
      };
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Loader2 size={24} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--lk-primary)' }} />
      </div>
    );
  }

  const isValid = days.some(d => d.enabled && d.services.length > 0);
  const hasChanges = deletedIds.length > 0 || JSON.stringify(days) !== JSON.stringify(originalDays);
  const dayConfig = days[activeDay];

  return (
    <div className="lk-animate-up" style={{ maxWidth: 1440, margin: '0 auto' }}>
      <PageHeader
        title="Horaires d'ouverture"
        subtitle="Definissez quand vos clients peuvent reserver."
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="md" icon={<Repeat size={14} strokeWidth={2} />} onClick={() => copyToAll(activeDay)} disabled={!dayConfig.enabled}>
              Copier vers...
            </Button>
            <Button variant="primary" size="md" icon={saving ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={14} />} onClick={handleSave} disabled={!isValid || !hasChanges || saving}>
              Enregistrer
            </Button>
          </div>
        }
      />

      {error && <p className="form-error" style={{ margin: '12px 0' }}>{error}</p>}
      {success && <p style={{ margin: '12px 0', color: 'var(--lk-success)', fontSize: 'var(--fs-sm)' }}>{success}</p>}

      {/* Week strip */}
      <Card padded={false} style={{ overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {DAYS.map((dayName, i) => {
            const d = days[i];
            const isActive = i === activeDay;
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  padding: '14px 12px',
                  textAlign: 'left',
                  border: 'none',
                  borderRight: i < 6 ? '1px solid var(--lk-border)' : undefined,
                  borderTop: isActive ? '2px solid var(--lk-primary)' : '2px solid transparent',
                  background: isActive ? 'var(--lk-primary-tint)' : 'var(--lk-bg-card)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{
                  fontSize: 'var(--fs-xs)', fontWeight: 600,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: isActive ? 'var(--lk-primary-strong)' : 'var(--lk-text-muted)',
                  marginBottom: 5,
                }}>
                  {dayName.slice(0, 3)}
                </div>
                {d.enabled ? (
                  <>
                    <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                      {d.services.length} service{d.services.length > 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                      {d.services[0]?.open_time}–{d.services[d.services.length - 1]?.close_time}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={11} strokeWidth={2} /> Ferme
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day editor + week preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Day editor */}
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--lk-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, margin: 0 }}>
                {DAYS[activeDay]}
              </h2>
              <label className="toggle">
                <input type="checkbox" checked={dayConfig.enabled} onChange={() => toggleDay(activeDay)} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
                {dayConfig.enabled ? 'Ouvert' : 'Ferme'}
              </span>
            </div>
            {dayConfig.enabled && (
              <button
                onClick={() => copyToAll(activeDay)}
                style={{
                  fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
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
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--lk-border)' }}>
              <button
                onClick={() => addService(activeDay)}
                style={{
                  width: '100%', padding: 10, borderRadius: 'var(--radius)',
                  border: '1px dashed var(--lk-border-strong)', background: 'transparent',
                  fontSize: 'var(--fs-sm)', fontWeight: 500,
                  color: 'var(--lk-text-secondary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} strokeWidth={2.4} /> Ajouter un service
              </button>
            </div>
          )}
        </Card>

        {/* Week preview */}
        <Card padded={false} style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 8 }}>
            Apercu de la semaine
          </div>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)', marginBottom: 14 }}>
            Chaque bloc represente un service.
          </p>
          {DAYS.map((d, i) => {
            const cfg = days[i];
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 38, fontSize: 'var(--fs-xs)', fontWeight: 500, color: 'var(--lk-text-muted)' }}>
                  {d.slice(0, 3)}
                </div>
                <div style={{ flex: 1, height: 14, background: 'var(--lk-surface-2)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  {cfg.enabled && cfg.services.map((s, si) => {
                    const start = timeToFrac(s.open_time);
                    const end = timeToFrac(s.close_time);
                    return (
                      <div key={si} style={{
                        position: 'absolute', left: `${start * 100}%`, width: `${(end - start) * 100}%`,
                        top: 2, bottom: 2,
                        background: 'var(--lk-primary)', borderRadius: 3, opacity: 0.85,
                      }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
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
    <div style={{ padding: '18px 20px', borderTop: showBorder ? '1px solid var(--lk-border)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <input
          value={svc.service_name}
          onChange={e => onUpdate('service_name', e.target.value)}
          placeholder="Nom du service"
          style={{
            fontSize: 'var(--fs-base)', fontWeight: 600,
            padding: '4px 8px', marginLeft: -8,
            border: '1px solid transparent', borderRadius: 6,
            background: 'transparent', outline: 'none',
            color: 'var(--lk-text-primary)',
          }}
        />
        {canDelete && (
          <button
            onClick={onDelete}
            style={{
              color: 'var(--lk-text-muted)', fontSize: 'var(--fs-sm)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <Trash2 size={12} /> Supprimer
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <FieldLabel label="Ouverture">
          <input type="time" value={svc.open_time} onChange={e => onUpdate('open_time', e.target.value)} style={inputStyle} />
        </FieldLabel>
        <FieldLabel label="Fermeture">
          <input type="time" value={svc.close_time} onChange={e => onUpdate('close_time', e.target.value)} style={inputStyle} />
        </FieldLabel>
        <FieldLabel label="Duree repas">
          <select value={svc.slot_duration_min} onChange={e => onUpdate('slot_duration_min', +e.target.value)} style={inputStyle}>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Intervalle">
          <select value={svc.slot_interval_min} onChange={e => onUpdate('slot_interval_min', +e.target.value)} style={inputStyle}>
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
    <div style={{
      marginTop: 14, position: 'relative', height: 30,
      background: 'var(--lk-surface-1)', borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      {Array.from({ length: 24 }).map((_, h) => (
        <div key={h} style={{ position: 'absolute', left: `${(h / 24) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--lk-border)' }} />
      ))}
      <div style={{
        position: 'absolute',
        left: `${startFrac * 100}%`,
        width: `${(endFrac - startFrac) * 100}%`,
        top: 5, bottom: 5,
        background: 'linear-gradient(90deg, var(--lk-primary-soft), var(--lk-primary))',
        borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--fs-xs)', fontWeight: 600,
        color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.15)', fontVariantNumeric: 'tabular-nums',
      }}>
        {from}–{to}
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 500, color: 'var(--lk-text-secondary)' }}>
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

const inputStyle: React.CSSProperties = {
  height: 34, padding: '0 10px', fontSize: 'var(--fs-sm)',
  border: '1px solid var(--lk-border)', borderRadius: 'var(--radius-sm)',
  background: 'var(--lk-bg-card)', outline: 'none', color: 'var(--lk-text-primary)',
  width: '100%',
};
