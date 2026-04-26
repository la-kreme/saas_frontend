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
    <div className="lk-fp-mode-picker">
      {modes.map(m => {
        const active = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id === 'service' ? today() : null)}
            className={`lk-fp-mode-btn ${active ? 'lk-fp-mode-btn--active' : 'lk-fp-mode-btn--inactive'}`}
          >
            <m.icon size={13} strokeWidth={2} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
