interface CardProps {
  padded?: boolean;
  hover?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ padded = true, hover = false, children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--lk-bg-card)',
        border: '1px solid var(--lk-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: padded ? '22px 24px' : undefined,
        transition: hover ? 'all var(--transition)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
