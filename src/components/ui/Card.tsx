interface CardProps {
  padded?: boolean;
  hover?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ padded = true, hover = false, children, style, className }: CardProps) {
  const cls = [
    'lk-card',
    padded && 'lk-card--padded',
    hover && 'lk-card--hover',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
