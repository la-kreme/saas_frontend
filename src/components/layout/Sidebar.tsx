import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Code2, Settings as SettingsIcon,
  LogOut, LayoutGrid, Clock, Globe, Lock, Sparkles,
} from 'lucide-react';
import { useTourSafe, TOUR_STEPS } from '../../contexts/OnboardingTourContext';
import { Avatar } from '../ui/Avatar';

// ─── Nav config ──��──────────────────────────────────────────────────────────

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly end?: boolean;
  readonly requiresLinkedPlace?: boolean;
  readonly group: 'service' | 'config' | 'marque';
  readonly badge?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard',              label: "Aujourd'hui",  icon: LayoutDashboard, end: true,  group: 'service' },
  { to: '/dashboard/reservations', label: 'Reservations', icon: CalendarDays,               group: 'service' },
  { to: '/dashboard/floorplan',    label: 'Plan de salle', icon: LayoutGrid,                 group: 'service' },
  { to: '/dashboard/hours',        label: 'Horaires',     icon: Clock,                       group: 'config' },
  { to: '/dashboard/widget',       label: 'Mon widget',   icon: Code2,                       group: 'config' },
  { to: '/dashboard/my-page',      label: 'Ma page LK',   icon: Globe, requiresLinkedPlace: true, group: 'marque' },
  { to: '/dashboard/settings',     label: 'Parametres',   icon: SettingsIcon,                group: 'config' },
];

const GROUP_LABELS: Record<string, string> = {
  service: 'Service',
  config: 'Configuration',
  marque: 'Marque',
};

// ─── Nav items renderer ─────────────────────────────────────────────────────

function SidebarNavItems({ hasLinkedPlace, onClose }: { hasLinkedPlace: boolean; onClose?: () => void }) {
  const tour = useTourSafe();
  const location = useLocation();
  const tourTargetPath = tour?.isActive ? TOUR_STEPS[tour.currentStep].path : null;

  const groups = ['service', 'config', 'marque'] as const;

  return (
    <>
      {groups.map((group) => {
        const items = NAV_ITEMS.filter(i => i.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <span className="sidebar-section-label">{GROUP_LABELS[group]}</span>
            {items.map(({ to, label, icon: Icon, end, requiresLinkedPlace, badge }) => {
              const isLocked = requiresLinkedPlace && !hasLinkedPlace;
              const isTourActive = tour?.isActive ?? false;
              const isTourTarget = isTourActive && to === tourTargetPath;
              const isTourDimmed = isTourActive && !isTourTarget;
              const isDisabled = isTourActive || isLocked;

              return (
                <NavLink
                  key={to}
                  to={isDisabled ? location.pathname : to}
                  end={end}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={(e) => {
                    if (isDisabled) e.preventDefault();
                    else onClose?.();
                  }}
                  style={{
                    opacity: isLocked || isTourDimmed ? 0.4 : 1,
                    filter: isLocked ? 'grayscale(1)' : 'none',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    position: 'relative',
                  }}
                >
                  <Icon size={16} strokeWidth={1.7} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      fontSize: 'var(--fs-xs)',
                      fontWeight: 600,
                      background: 'var(--lk-warning-tint)',
                      color: 'var(--lk-warning)',
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 7px',
                      lineHeight: '16px',
                    }}>
                      {badge}
                    </span>
                  )}
                  {isLocked && <Lock size={12} style={{ opacity: 0.7 }} />}
                  {isTourTarget && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--lk-primary)',
                      animation: 'lk-pulse 1.5s ease-in-out infinite',
                      flexShrink: 0,
                    }} />
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

interface SidebarProps {
  restaurantName: string;
  userEmail: string;
  hasLinkedPlace: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ restaurantName, userEmail, hasLinkedPlace, isMobileOpen, onClose, onLogout }: SidebarProps) {
  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo + restaurant */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Le Koulis" style={{ height: 36, width: 'auto' }} />
      </div>

      {/* Restaurant card */}
      {restaurantName && (
        <div style={{ padding: '14px 12px 6px' }}>
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 10px',
            borderRadius: 'var(--radius)',
            background: 'var(--lk-surface-2)',
            border: '1px solid var(--lk-border)',
          }}>
            <Avatar name={restaurantName} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--fs-sm)',
                fontWeight: 600,
                color: 'var(--lk-text-primary)',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {restaurantName}
              </div>
              <div style={{
                fontSize: 'var(--fs-xs)',
                color: 'var(--lk-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lk-success)', flexShrink: 0 }} />
                en ligne
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <SidebarNavItems hasLinkedPlace={hasLinkedPlace} onClose={onClose} />

        {/* Footer */}
        <div className="mt-auto" style={{ paddingTop: 24 }}>
          {/* Agent IA promo */}
          <div style={{
            margin: '0 0 12px',
            padding: '12px',
            background: 'linear-gradient(135deg, var(--lk-primary-tint) 0%, var(--lk-secondary-tint) 100%)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Sparkles size={16} style={{ color: 'var(--lk-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--lk-text-primary)' }}>
                Agent IA
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--lk-text-muted)' }}>
                Bientot disponible
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: '12px 0' }} />

          {/* User */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 12px 8px',
          }}>
            <Avatar name={userEmail} size={28} />
            <span style={{
              fontSize: 'var(--fs-sm)',
              color: 'var(--lk-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}>
              {userEmail}
            </span>
          </div>

          <button
            className="nav-item"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
            onClick={onLogout}
          >
            <LogOut size={16} strokeWidth={1.7} />
            Deconnexion
          </button>
        </div>
      </nav>
    </aside>
  );
}
