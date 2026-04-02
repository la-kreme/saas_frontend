import { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { getMyHours, createHour, updateHour, deleteHour } from '../../lib/api';

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

  // Keep track of original state for diffing
  const [originalDays, setOriginalDays] = useState<DayConfig[]>(defaultDays());
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      setLoading(true);
      const data = await getMyHours();
      
      const newDays = defaultDays();
      
      // Populate newDays with the fetched data
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
    } catch (err: any) {
      setError("Impossible de charger les horaires");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const willBeDisabled = d.enabled;
      
      // If we are disabling, queue all existing services for deletion
      if (willBeDisabled) {
        d.services.forEach(s => {
          if (s.id) setDeletedIds(prevIds => [...prevIds, s.id!]);
        });
      }
      
      return { 
        ...d, 
        enabled: !d.enabled,
        // Reset services if re-enabling
        services: willBeDisabled ? [makeService()] : d.services
      };
    }));
    setSuccess('');
  };

  const updateService = (dayIdx: number, svcIdx: number, field: keyof EditableService, value: string | number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      return {
        ...d,
        services: d.services.map((s, si) =>
          si !== svcIdx ? s : { ...s, [field]: value }
        ),
      };
    }));
    setSuccess('');
  };

  const addService = (dayIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, services: [...d.services, makeService()] }
    ));
    setSuccess('');
  };

  const removeService = (dayIdx: number, svcIdx: number) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const svcToRemove = d.services[svcIdx];
      if (svcToRemove.id) {
        setDeletedIds(prevIds => [...prevIds, svcToRemove.id!]);
      }
      return { ...d, services: d.services.filter((_, si) => si !== svcIdx) };
    }));
    setSuccess('');
  };

  const copyToAll = (dayIdx: number) => {
    const source = days[dayIdx];
    setDays(prev => prev.map((d, i) => {
      if (i === dayIdx || !d.enabled) return d;
      
      // If we overwrite an enabled day that had ID'd services, we need to delete them!
      d.services.forEach(s => {
        if (s.id) setDeletedIds(prevIds => [...prevIds, s.id!]);
      });
      
      // Copy source services, but clear their IDs and tempIds
      const copiedServices = JSON.parse(JSON.stringify(source.services)).map((s: EditableService) => ({
        ...s,
        id: undefined,
        tempId: crypto.randomUUID()
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
      // 1. Process deletes
      for (const id of deletedIds) {
        await deleteHour(id);
      }

      // 2. Process creates and updates
      for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
        const d = days[dayIdx];
        if (!d.enabled) continue;

        for (const s of d.services) {
          const payload = {
            day_of_week: dayIdx,
            open_time: s.open_time,
            close_time: s.close_time,
            slot_duration_min: s.slot_duration_min,
            slot_interval_min: s.slot_interval_min,
            service_name: s.service_name,
          };

          if (!s.id) {
            await createHour(payload);
          } else {
            // Find orig to see if changed
            const origDay = originalDays[dayIdx];
            const origSvc = origDay.enabled ? origDay.services.find(os => os.id === s.id) : null;
            
            if (origSvc && (
              origSvc.open_time !== s.open_time ||
              origSvc.close_time !== s.close_time ||
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
      setSuccess('Horaires enregistrés avec succès');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  const isValid = days.some(d => d.enabled && d.services.length > 0);
  const hasChanges = deletedIds.length > 0 || JSON.stringify(days) !== JSON.stringify(originalDays);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lk-text-base)', marginBottom: '4px' }}>Horaires d'ouverture</h1>
          <p className="text-sm text-muted">Définissez quand vos clients peuvent réserver.</p>
        </div>
        
        <button
          className="btn btn-primary"
          disabled={!isValid || !hasChanges || saving}
          onClick={handleSave}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer
        </button>
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
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={days[dayIdx].enabled}
                    onChange={() => toggleDay(dayIdx)}
                  />
                  <span className="slider" />
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
              <div key={svc.tempId} style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--lk-border)',
                background: 'var(--lk-dark)',
              }}>
                {/* Service name */}
                <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                  <input
                    className="form-input"
                    style={{ flex: 1, height: '32px', fontSize: '12px' }}
                    placeholder="Nom du service (optionnel : Brunch, Déjeuner...)"
                    value={svc.service_name || ""}
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

            {/* Add service button */}
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

      {error && <p className="form-error" style={{ marginTop: '16px' }}>{error}</p>}
      {success && <p className="text-sm" style={{ marginTop: '16px', color: 'var(--lk-success)' }}>{success}</p>}
      
      <div style={{ paddingBottom: '40px' }} />
    </div>
  );
}
