type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'sky' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const toneStyles: Record<BadgeTone, { background: string; color: string }> = {
  primary: { background: 'var(--lk-primary-tint)', color: 'var(--lk-primary-strong)' },
  success: { background: 'var(--lk-success-tint)', color: 'var(--lk-success)' },
  warning: { background: 'var(--lk-warning-tint)', color: 'var(--lk-warning)' },
  error:   { background: 'var(--lk-error-tint)',   color: 'var(--lk-error)' },
  info:    { background: 'var(--lk-info-tint)',    color: 'var(--lk-info)' },
  sky:     { background: 'var(--lk-secondary-tint)', color: 'var(--lk-secondary-strong)' },
  neutral: { background: 'var(--lk-surface-3)',    color: 'var(--lk-text-muted)' },
};

export function Badge({ tone = 'neutral', icon, children, style }: BadgeProps) {
  const t = toneStyles[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 22,
        padding: '0 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 11.5,
        fontWeight: 600,
        background: t.background,
        color: t.color,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
