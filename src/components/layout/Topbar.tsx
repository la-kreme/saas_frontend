import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Kbd } from '../ui/Kbd';

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

  return (
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

      {/* Center: search trigger (visuel only, feature a venir) */}
      <div className="hide-on-mobile lk-topbar-search">
        <Search size={14} strokeWidth={2} />
        <span className="lk-topbar-search-text">Rechercher un client, une reservation...</span>
        <Kbd>⌘</Kbd><Kbd>K</Kbd>
      </div>

      {/* Right: actions */}
      <div className="lk-topbar-right">
        <Badge tone="primary">Beta</Badge>
        <button
          title="Notifications"
          className="lk-topbar-notif-btn"
        >
          <Bell size={16} strokeWidth={1.8} />
          <span className="lk-topbar-notif-dot" />
        </button>
        <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={onNewResa}>
          Nouvelle resa
        </Button>
      </div>
    </header>
  );
}
