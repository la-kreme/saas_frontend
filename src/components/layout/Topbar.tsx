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
    <header className="topbar" style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      gap: 16,
    }}>
      {/* Left: mobile menu + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button className="mobile-menu-btn" onClick={onMobileMenuOpen}>
          <Menu size={20} />
        </button>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--lk-text-muted)' }}>
          {restaurantName || 'Mon Restaurant'}
        </span>
        {pageTitle && (
          <>
            <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--lk-text-muted)' }} />
            <span style={{
              fontSize: 'var(--fs-sm)',
              fontWeight: 500,
              color: 'var(--lk-text-primary)',
            }}>
              {pageTitle}
            </span>
          </>
        )}
      </div>

      {/* Center: search trigger (visuel only, feature a venir) */}
      <div
        className="hide-on-mobile"
        style={{
          flex: 1,
          maxWidth: 480,
          marginLeft: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          height: 36,
          background: 'var(--lk-surface-2)',
          border: '1px solid var(--lk-border)',
          borderRadius: 'var(--radius)',
          color: 'var(--lk-text-muted)',
          fontSize: 'var(--fs-sm)',
        }}
      >
        <Search size={14} strokeWidth={2} />
        <span style={{ flex: 1 }}>Rechercher un client, une reservation...</span>
        <Kbd>⌘</Kbd><Kbd>K</Kbd>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        <Badge tone="primary">Beta</Badge>
        <button
          title="Notifications"
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius)',
            border: '1px solid transparent',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--lk-text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Bell size={16} strokeWidth={1.8} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--lk-primary)',
            border: '2px solid var(--lk-surface-1)',
          }} />
        </button>
        <Button variant="primary" size="md" icon={<Plus size={14} strokeWidth={2.4} />} onClick={onNewResa}>
          Nouvelle resa
        </Button>
      </div>
    </header>
  );
}
