interface FilterPillProps {
  active: boolean;
  count?: number;
  children: React.ReactNode;
  onClick: () => void;
}

export function FilterPill({ active, count, children, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontSize: 'var(--fs-sm)',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--lk-primary-tint)' : 'transparent',
        color: active ? 'var(--lk-primary-strong)' : 'var(--lk-text-secondary)',
        border: '1px solid',
        borderColor: active ? 'rgba(237, 115, 169, 0.18)' : 'var(--lk-border)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
      {count !== undefined && (
        <span style={{ fontSize: 'var(--fs-xs)', opacity: 0.7, fontWeight: 600 }}>
          {count}
        </span>
      )}
    </button>
  );
}
