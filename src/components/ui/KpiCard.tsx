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
    <div className="lk-kpi">
      <div className="lk-kpi__header">
        <div className="lk-kpi__icon" style={{ background: tint }}>
          {icon}
        </div>
        <div className="lk-kpi__indicators">
          {trend && (
            <span className="lk-kpi__trend">
              {trend}
            </span>
          )}
          {hot && <span className="lk-kpi__hot" />}
        </div>
      </div>
      <div className="lk-kpi__label">
        {label}
      </div>
      <div className="lk-kpi__value-row">
        <span className="lk-kpi__value">
          {value}
        </span>
        {sub && (
          <span className="lk-kpi__sub">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
