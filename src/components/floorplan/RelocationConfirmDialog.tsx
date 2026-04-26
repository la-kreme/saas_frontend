import { AlertTriangle, X } from 'lucide-react';
import type { MergePreview } from '../../lib/types';

interface Props {
  preview: MergePreview;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RelocationConfirmDialog({ preview, onConfirm, onCancel }: Props) {
  const isBlocked = preview.status === 'blocked';

  return (
    <div className="lk-fp-overlay lk-fp-overlay--z110">
      <div className="card lk-fp-dialog--md">
        <div className="lk-fp-dialog-header">
          <h3 className="lk-fp-dialog-title--with-icon">
            <AlertTriangle size={18} className={isBlocked ? 'lk-fp-reloc-icon--blocked' : 'lk-fp-reloc-icon--warn'} />
            {isBlocked ? 'Fusion impossible' : 'Reservations a deplacer'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {preview.conflicts.length > 0 && (
          <div className="lk-fp-reloc-conflicts">
            <p className="lk-fp-reloc-conflicts-label">
              {preview.conflicts.length} reservation(s) en conflit :
            </p>
            {preview.conflicts.map((c) => (
              <div key={c.reservation_id} className="lk-fp-reloc-conflict-item">
                {c.guest_name} - {c.time}
              </div>
            ))}
          </div>
        )}

        {preview.relocation_plan.length > 0 && (
          <p className="lk-fp-reloc-plan-text">
            {preview.relocation_plan.length} reservation(s) seront deplacees automatiquement.
          </p>
        )}

        {preview.unrelocatable.length > 0 && (
          <p className="lk-fp-reloc-unrelocatable-text">
            {preview.unrelocatable.length} reservation(s) ne peuvent pas etre relocalisees.
          </p>
        )}

        <div className="lk-fp-dialog-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Annuler</button>
          {!isBlocked && (
            <button className="btn btn-primary" onClick={onConfirm}>
              Confirmer la fusion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
