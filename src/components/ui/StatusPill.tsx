import { Check, Clock, X } from 'lucide-react';
import { Badge } from './Badge';

type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'no_show';

interface StatusPillProps {
  status: ReservationStatus | string;
}

const config: Record<string, { tone: 'success' | 'warning' | 'error' | 'neutral'; label: string; icon: React.ReactNode }> = {
  confirmed: { tone: 'success', label: 'Confirmee',  icon: <Check size={11} strokeWidth={2.4} /> },
  pending:   { tone: 'warning', label: 'En attente', icon: <Clock size={11} strokeWidth={2.4} /> },
  cancelled: { tone: 'error',   label: 'Annulee',    icon: <X size={11} strokeWidth={2.4} /> },
  no_show:   { tone: 'neutral', label: 'No-show',    icon: null },
};

export function StatusPill({ status }: StatusPillProps) {
  const c = config[status] ?? config.pending;
  return (
    <Badge tone={c.tone} icon={c.icon}>
      {c.label}
    </Badge>
  );
}
