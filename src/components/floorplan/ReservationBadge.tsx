import type { ReservationItem } from '../../lib/types';

interface Props {
  reservations: ReservationItem[];
  tableX: number;
  tableY: number;
  tableWidth: number;
}

export function ReservationBadge({ reservations, tableX, tableY, tableWidth }: Props) {
  if (reservations.length === 0) return null;

  const statusColor: Record<string, string> = {
    confirmed: '#22c55e',
    pending: '#f59e0b',
    cancelled: '#ef4444',
  };

  return (
    <>
      {reservations.slice(0, 2).map((r, i) => (
        <g key={r.id}>
          <rect
            x={tableX + tableWidth + 4}
            y={tableY + i * 20}
            width={60}
            height={16}
            rx={4}
            fill={statusColor[r.status] ?? '#888'}
            opacity={0.9}
          />
          <text
            x={tableX + tableWidth + 8}
            y={tableY + i * 20 + 12}
            fontSize={9}
            fontWeight={600}
            fill="#fff"
          >
            {r.reservation_time} · {r.party_size}p
          </text>
        </g>
      ))}
      {reservations.length > 2 && (
        <text
          x={tableX + tableWidth + 8}
          y={tableY + 52}
          fontSize={9}
          fill="var(--lk-text-muted)"
        >
          +{reservations.length - 2}
        </text>
      )}
    </>
  );
}
