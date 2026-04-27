import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, CalendarDays, LayoutGrid, Clock, Code2, Settings, X,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGES = [
  { path: '/dashboard', label: "Aujourd'hui", icon: LayoutDashboard },
  { path: '/dashboard/reservations', label: 'Reservations', icon: CalendarDays },
  { path: '/dashboard/floorplan', label: 'Plan de salle', icon: LayoutGrid },
  { path: '/dashboard/hours', label: 'Horaires', icon: Clock },
  { path: '/dashboard/widget', label: 'Ma page de reservation', icon: Code2 },
  { path: '/dashboard/settings', label: 'Parametres', icon: Settings },
];

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = PAGES.filter(p =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return createPortal(
    <div className="lk-cmdk-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lk-cmdk-dialog">
        <div className="lk-cmdk-search">
          <Search size={16} className="lk-cmdk-search-icon" />
          <input
            ref={inputRef}
            className="lk-cmdk-input"
            placeholder="Rechercher une page..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="lk-cmdk-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="lk-cmdk-results">
          {filtered.length === 0 ? (
            <div className="lk-cmdk-empty">Aucun resultat</div>
          ) : (
            filtered.map(p => (
              <button
                key={p.path}
                className="lk-cmdk-item"
                onClick={() => handleSelect(p.path)}
              >
                <p.icon size={15} strokeWidth={1.7} className="lk-cmdk-item-icon" />
                <span>{p.label}</span>
              </button>
            ))
          )}
        </div>

        <div className="lk-cmdk-footer">
          <span className="lk-cmdk-hint">Entree pour naviguer</span>
          <span className="lk-cmdk-hint">Echap pour fermer</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
