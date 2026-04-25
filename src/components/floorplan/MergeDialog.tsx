import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  scope: string;
  tableIds: string[];
  onConfirm: (data: { scope: string; valid_from?: string; valid_until?: string; label?: string }) => void;
  onClose: () => void;
}

export function MergeDialog({ scope, tableIds, onConfirm, onClose }: Props) {
  const [label, setLabel] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const needsDates = scope !== 'permanent';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card" style={{ width: '400px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            Fusionner {tableIds.length} tables
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-group">
          <label>Label (optionnel)</label>
          <input className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Grande table terrasse" />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <span className="badge" style={{ background: scope === 'permanent' ? 'var(--lk-error-muted)' : 'var(--lk-info-muted)', color: scope === 'permanent' ? 'var(--lk-error)' : 'var(--lk-info)' }}>
            {scope === 'meal' ? 'Repas' : scope === 'service' ? 'Service entier' : 'Definitif'}
          </span>
        </div>

        {needsDates && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Debut</label>
              <input type="datetime-local" className="form-input" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Fin</label>
              <input type="datetime-local" className="form-input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm({
              scope,
              label: label || undefined,
              valid_from: needsDates && validFrom ? new Date(validFrom).toISOString() : undefined,
              valid_until: needsDates && validUntil ? new Date(validUntil).toISOString() : undefined,
            })}
            disabled={needsDates && (!validFrom || !validUntil)}
          >
            Fusionner
          </button>
        </div>
      </div>
    </div>
  );
}
