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
    <div className="lk-fp-merge-toolbar">
      <span className="lk-fp-merge-toolbar-count">
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
              className="btn btn-sm lk-fp-merge-toolbar-permanent-btn"
              onClick={() => onMerge('permanent')}
            >
              Definitif
            </button>
          ) : (
            <button
              className="btn btn-sm btn-ghost lk-fp-merge-toolbar-locked-btn"
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
