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
      className={`lk-filter-pill${active ? ' lk-filter-pill--active' : ''}`}
    >
      {children}
      {count !== undefined && (
        <span className="lk-filter-pill__count">
          {count}
        </span>
      )}
    </button>
  );
}
