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
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 500, color: 'var(--lk-text-secondary)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  fontSize: 'var(--fs-sm)',
  border: '1px solid var(--lk-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--lk-bg-card)',
  outline: 'none',
  color: 'var(--lk-text-primary)',
  width: '100%',
};

export function TableInspector({ table, onUpdate, onDelete, onClose }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card padded={false} style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 'var(--fs-base)', fontWeight: 600 }}>
            Table {table.name}
          </span>
          <IconBtn size={26} onClick={onClose}><X size={14} /></IconBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <Field label="Nom">
            <input
              style={inputStyle}
              value={table.name}
              onChange={(e) => onUpdate(table.id, { name: e.target.value })}
            />
          </Field>
          <Field label="Couverts">
            <input
              type="number"
              min={1}
              style={inputStyle}
              value={table.seats}
              onChange={(e) => onUpdate(table.id, { seats: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </Field>
        </div>

        <Field label="Forme">
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {(['rect', 'circle'] as const).map(s => (
              <button
                key={s}
                onClick={() => onUpdate(table.id, { shape: s })}
                style={{
                  flex: 1, height: 32, fontSize: 'var(--fs-sm)',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: table.shape === s ? 'rgba(237, 115, 169, 0.3)' : 'var(--lk-border)',
                  background: table.shape === s ? 'var(--lk-primary-tint)' : 'var(--lk-bg-card)',
                  color: table.shape === s ? 'var(--lk-primary-strong)' : 'var(--lk-text-secondary)',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                }}
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
            style={{ width: '100%', marginTop: 4 }}
          />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <input
            type="checkbox"
            checked={table.is_active}
            onChange={(e) => onUpdate(table.id, { is_active: e.target.checked })}
            id="table-active"
          />
          <label htmlFor="table-active" style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-secondary)', cursor: 'pointer' }}>
            Active
          </label>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={() => onDelete(table.id)}
            style={{ flex: 1 }}
          >
            Supprimer
          </Button>
        </div>
      </Card>
    </div>
  );
}
