import { X, Trash2 } from 'lucide-react';
import type { TableItem } from '../../lib/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconBtn } from '../ui/IconBtn';

interface Props {
  table: TableItem;
  onUpdate: (id: string, updates: Partial<TableItem>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="lk-fp-inspector-field">
      <span className="lk-fp-inspector-field-label">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TableInspector({ table, onUpdate, onDelete, onClose }: Props) {
  return (
    <div className="lk-fp-inspector-wrap">
      <Card padded={false} className="lk-fp-inspector-card">
        <div className="lk-fp-inspector-header">
          <span className="lk-fp-inspector-table-name">
            Table {table.name}
          </span>
          <IconBtn size={26} onClick={onClose}><X size={14} /></IconBtn>
        </div>

        <div className="lk-fp-inspector-fields-grid">
          <Field label="Nom">
            <input
              className="lk-fp-inspector-input"
              value={table.name}
              onChange={(e) => onUpdate(table.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Couverts">
            <input
              type="number"
              min={1}
              className="lk-fp-inspector-input"
              value={table.seats}
              onChange={(e) => onUpdate(table.id, { seats: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </Field>
        </div>

        <Field label="Forme">
          <div className="lk-fp-inspector-shape-row">
            {(['rect', 'circle'] as const).map(s => (
              <button
                key={s}
                onClick={() => onUpdate(table.id, { shape: s })}
                className={`lk-fp-inspector-shape-btn ${table.shape === s ? 'lk-fp-inspector-shape-btn--active' : ''}`}
              >
                {s === 'rect' ? 'Rectangle' : 'Rond'}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Rotation (${table.rotation}°)`}>
          <input
            type="range"
            min={0} max={360} step={15}
            value={table.rotation}
            onChange={(e) => onUpdate(table.id, { rotation: +e.target.value })}
            className="lk-fp-inspector-range"
          />
        </Field>

        <div className="lk-fp-inspector-active-row">
          <input
            type="checkbox"
            checked={table.is_active}
            onChange={(e) => onUpdate(table.id, { is_active: e.target.checked })}
            id="table-active"
          />
          <label htmlFor="table-active" className="lk-fp-inspector-active-label">
            Active
          </label>
        </div>

        <div className="lk-fp-inspector-actions">
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={() => onDelete(table.id)}
            className="lk-flex-1"
          >
            Supprimer
          </Button>
        </div>
      </Card>
    </div>
  );
}
