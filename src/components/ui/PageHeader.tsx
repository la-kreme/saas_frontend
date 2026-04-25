interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, right }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 16,
    }}>
      <div>
        {eyebrow && (
          <div style={{
            fontSize: 'var(--fs-xs)',
            fontWeight: 500,
            color: 'var(--lk-primary-strong)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{
          fontSize: 'var(--fs-xl)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--lk-text-primary)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 'var(--fs-base)',
            color: 'var(--lk-text-muted)',
            margin: '4px 0 0',
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
