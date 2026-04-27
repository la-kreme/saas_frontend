import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Kbd } from '../ui/Kbd';
import { NotificationDropdown } from './NotificationDropdown';
import { CommandPalette } from './CommandPalette';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': "Aujourd'hui",
  '/dashboard/reservations': 'Reservations',
  '/dashboard/floorplan': 'Plan de salle',
  '/dashboard/hours': 'Horaires',
  '/dashboard/widget': 'Ma page de reservation',
  '/dashboard/my-page': 'Ma page LK',
  '/dashboard/settings': 'Parametres',
};

interface TopbarProps {
  restaurantName: string;
  onMobileMenuOpen: () => void;
  onNewResa?: () => void;
}

export function Topbar({ restaurantName, onMobileMenuOpen, onNewResa }: TopbarProps) {
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? '';
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);

  // Global Cmd+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdkOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="topbar lk-topbar-inner">
        {/* Left: mobile menu + breadcrumb */}
        <div className="lk-topbar-left">
          <button className="mobile-menu-btn" onClick={onMobileMenuOpen}>
            <Menu size={20} />
          </button>
          <span className="lk-topbar-breadcrumb-muted">
            {restaurantName || 'Mon Restaurant'}
          </span>
          {pageTitle && (
            <>
              <ChevronRight size={12} strokeWidth={2} className="lk-topbar-breadcrumb-chevron" />
              <span className="lk-topbar-breadcrumb-current">
                {pageTitle}
              </span>
            </>
          )}
        </div>

        {/* Center: search trigger */}
        <div
          className="hide-on-mobile lk-topbar-search"
          onClick={() => setCmdkOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') setCmdkOpen(true); }}
        >
          <Search size={14} strokeWidth={2} />
          <span className="lk-topbar-search-text">Rechercher un client, une reservation...</span>
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
        </div>

        {/* Right: actions */}
        <div className="lk-topbar-right">
          <Badge tone="primary">Beta</Badge>
          <NotificationDropdown
            open={notifOpen}
            onToggle={() => setNotifOpen(o => !o)}
            onClose={() => setNotifOpen(false)}
          />
          <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={onNewResa}>
            Nouvelle resa
          </Button>
        </div>
      </header>

      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
    </>
  );
}
