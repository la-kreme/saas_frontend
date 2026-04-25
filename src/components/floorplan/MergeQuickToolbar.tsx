import { Utensils, Clock, Lock, Merge } from 'lucide-react';

interface Props {
  selectedCount: number;
  permanentUnlocked: boolean;
  isServiceMode: boolean;
  onMerge: (scope: 'meal' | 'service' | 'permanent') => void;
  onUnlockPermanent: () => void;
}

export function MergeQuickToolbar({ selectedCount, permanentUnlocked, isServiceMode, onMerge, onUnlockPermanent }: Props) {
  if (selectedCount < 2) return null;

  return (
    <div style={{
      display: 'flex', gap: '6px', padding: '8px 12px',
      background: '#FFFFFF', borderRadius: 'var(--radius)',
      border: '1px solid var(--lk-border)', alignItems: 'center',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--lk-text-muted)', marginRight: '4px' }}>
        {selectedCount} tables
      </span>

      {isServiceMode ? (
        <>
          <button className="btn btn-sm btn-primary" onClick={() => onMerge('meal')}>
            <Utensils size={12} /> Repas
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => onMerge('service')}>
            <Clock size={12} /> Service entier
          </button>
          {permanentUnlocked ? (
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--lk-error)', border: '1px solid var(--lk-error)' }}
              onClick={() => onMerge('permanent')}
            >
              Definitif
            </button>
          ) : (
            <button
              className="btn btn-sm btn-ghost"
              style={{ opacity: 0.4 }}
              onClick={onUnlockPermanent}
            >
              Definitif <Lock size={10} />
            </button>
          )}
        </>
      ) : (
        <button className="btn btn-sm btn-primary" onClick={() => onMerge('permanent')}>
          <Merge size={12} /> Fusionner
        </button>
      )}
    </div>
  );
}
