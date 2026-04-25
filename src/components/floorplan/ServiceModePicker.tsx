import { Pencil, Eye } from 'lucide-react';

interface Props {
  date: string | null;
  onChange: (date: string | null) => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const modes = [
  { id: 'edit', label: 'Edition', icon: Pencil },
  { id: 'service', label: 'Service', icon: Eye },
] as const;

export function ServiceModePicker({ date, onChange }: Props) {
  const current = date !== null ? 'service' : 'edit';

  return (
    <div style={{
      display: 'flex',
      padding: 3,
      background: 'var(--lk-surface-2)',
      border: '1px solid var(--lk-border)',
      borderRadius: 'var(--radius)',
    }}>
      {modes.map(m => {
        const active = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id === 'service' ? today() : null)}
            style={{
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 7,
              fontSize: 'var(--fs-sm)',
              fontWeight: 500,
              background: active ? 'var(--lk-bg-card)' : 'transparent',
              color: active ? 'var(--lk-text-primary)' : 'var(--lk-text-muted)',
              boxShadow: active ? 'var(--shadow-xs)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <m.icon size={13} strokeWidth={2} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
