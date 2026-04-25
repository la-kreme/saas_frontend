interface IconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  children: React.ReactNode;
}

export function IconBtn({ size = 32, children, style, ...rest }: IconBtnProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--lk-border)',
        background: 'var(--lk-bg-card)',
        color: 'var(--lk-text-secondary)',
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        padding: 0,
        fontFamily: 'inherit',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
