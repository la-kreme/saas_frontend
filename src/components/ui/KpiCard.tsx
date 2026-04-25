interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tint: string;
  trend?: string;
  sub?: string;
  hot?: boolean;
}

export function KpiCard({ label, value, icon, tint, trend, sub, hot }: KpiCardProps) {
  return (
    <div style={{
      background: 'var(--lk-bg-card)',
      border: '1px solid var(--lk-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-fast)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 'var(--radius)',
          background: tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend && (
            <span style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 500,
              color: 'var(--lk-success)',
            }}>
              {trend}
            </span>
          )}
          {hot && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--lk-warning)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          )}
        </div>
      </div>
      <div style={{
        fontSize: 'var(--fs-xs)',
        fontWeight: 600,
        color: 'var(--lk-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize: 'var(--fs-2xl)',
          fontWeight: 700,
          color: 'var(--lk-text-primary)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
