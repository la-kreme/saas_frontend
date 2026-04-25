interface KbdProps {
  children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 20,
      height: 20,
      padding: '0 5px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--lk-surface-2)',
      border: '1px solid var(--lk-border)',
      fontSize: 'var(--fs-xs)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      color: 'var(--lk-text-muted)',
      lineHeight: 1,
    }}>
      {children}
    </kbd>
  );
}
