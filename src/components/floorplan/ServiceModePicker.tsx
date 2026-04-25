import { LayoutDashboard, CalendarCheck } from 'lucide-react';

interface Props {
  date: string | null;
  onChange: (date: string | null) => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ServiceModePicker({ date, onChange }: Props) {
  const isService = date !== null;

  return isService ? (
    <button
      className="btn btn-sm btn-secondary"
      onClick={() => onChange(null)}
    >
      <LayoutDashboard size={14} />
      Mode Plan
    </button>
  ) : (
    <button
      className="btn btn-sm btn-primary"
      onClick={() => onChange(today())}
    >
      <CalendarCheck size={14} />
      Mode Service
    </button>
  );
}
