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
    <div className="lk-fp-overlay">
      <div className="card lk-fp-dialog">
        <div className="lk-fp-dialog-header">
          <h3 className="lk-fp-dialog-title">
            Fusionner {tableIds.length} tables
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-group">
          <label>Label (optionnel)</label>
          <input className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Grande table terrasse" />
        </div>

        <div className="lk-fp-merge-scope-row">
          <span className={`badge ${scope === 'permanent' ? 'lk-fp-merge-scope-badge--permanent' : 'lk-fp-merge-scope-badge--temp'}`}>
            {scope === 'meal' ? 'Repas' : scope === 'service' ? 'Service entier' : 'Definitif'}
          </span>
        </div>

        {needsDates && (
          <div className="lk-fp-merge-dates-row">
            <div className="form-group lk-flex-1">
              <label>Debut</label>
              <input type="datetime-local" className="form-input" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div className="form-group lk-flex-1">
              <label>Fin</label>
              <input type="datetime-local" className="form-input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
        )}

        <div className="lk-fp-dialog-footer">
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
