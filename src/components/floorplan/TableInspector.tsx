import { X, Trash2 } from 'lucide-react';
import type { TableItem } from '../../lib/types';

interface Props {
  table: TableItem;
  onUpdate: (id: string, updates: Partial<TableItem>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function TableInspector({ table, onUpdate, onDelete, onClose }: Props) {
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: '280px', background: 'var(--lk-bg-base)',
      borderLeft: '1px solid var(--lk-border)',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
      zIndex: 40, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>Table</h4>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
      </div>

      <div className="form-group">
        <label>Nom</label>
        <input
          className="form-input"
          value={table.name}
          onChange={(e) => onUpdate(table.id, { name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Places</label>
        <div className="stepper">
          <button onClick={() => onUpdate(table.id, { seats: Math.max(1, table.seats - 1) })}>-</button>
          <span>{table.seats}</span>
          <button onClick={() => onUpdate(table.id, { seats: table.seats + 1 })}>+</button>
        </div>
      </div>

      <div className="form-group">
        <label>Forme</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${table.shape === 'rect' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onUpdate(table.id, { shape: 'rect' })}
          >
            Rectangle
          </button>
          <button
            className={`btn btn-sm ${table.shape === 'circle' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onUpdate(table.id, { shape: 'circle' })}
          >
            Rond
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Rotation ({table.rotation}°)</label>
        <input
          type="range"
          min={0}
          max={360}
          step={15}
          value={table.rotation}
          onChange={(e) => onUpdate(table.id, { rotation: +e.target.value })}
          style={{ width: '100%' }}
        />
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={table.is_active}
            onChange={(e) => onUpdate(table.id, { is_active: e.target.checked })}
          />
          Active
        </label>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button
          className="btn btn-ghost w-full"
          style={{ color: 'var(--lk-error)' }}
          onClick={() => onDelete(table.id)}
        >
          <Trash2 size={14} /> Supprimer
        </button>
      </div>
    </div>
  );
}
