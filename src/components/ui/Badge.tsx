type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'sky' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ tone = 'neutral', icon, children, className, style }: BadgeProps) {
  return (
    <span className={`lk-badge lk-badge--${tone}${className ? ` ${className}` : ''}`} style={style}>
      {icon}
      {children}
    </span>
  );
}
