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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 110,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="card" style={{ width: '460px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: isBlocked ? 'var(--lk-error)' : 'var(--lk-warning)' }} />
            {isBlocked ? 'Fusion impossible' : 'Reservations a deplacer'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}><X size={16} /></button>
        </div>

        {preview.conflicts.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--lk-text-muted)', marginBottom: '8px' }}>
              {preview.conflicts.length} reservation(s) en conflit :
            </p>
            {preview.conflicts.map((c) => (
              <div key={c.reservation_id} style={{
                padding: '8px 12px', background: 'var(--lk-bg-alt)',
                borderRadius: 'var(--radius-sm)', marginBottom: '4px',
                fontSize: '13px',
              }}>
                {c.guest_name} - {c.time}
              </div>
            ))}
          </div>
        )}

        {preview.relocation_plan.length > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--lk-text-muted)' }}>
            {preview.relocation_plan.length} reservation(s) seront deplacees automatiquement.
          </p>
        )}

        {preview.unrelocatable.length > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--lk-error)' }}>
            {preview.unrelocatable.length} reservation(s) ne peuvent pas etre relocalisees.
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
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
