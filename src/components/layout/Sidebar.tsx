import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Code2, Settings as SettingsIcon,
  LogOut, LayoutGrid, Clock, Globe, Lock, Sparkles,
} from 'lucide-react';
import { useTourSafe, TOUR_STEPS } from '../../contexts/OnboardingTourContext';
import { Avatar } from '../ui/Avatar';

// ─── Nav config ─────────────────────────────────────────────────────────────

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

              const linkClass = [
                'lk-sidebar-nav-link',
                isLocked ? 'lk-sidebar-nav-link--locked' : '',
                isTourDimmed ? 'lk-sidebar-nav-link--tour-dimmed' : '',
                isDisabled ? 'lk-sidebar-nav-link--disabled' : '',
              ].filter(Boolean).join(' ');

              return (
                <NavLink
                  key={to}
                  to={isDisabled ? location.pathname : to}
                  end={end}
                  className={({ isActive }) => `nav-item ${linkClass}${isActive ? ' active' : ''}`}
                  onClick={(e) => {
                    if (isDisabled) e.preventDefault();
                    else onClose?.();
                  }}
                >
                  <Icon size={16} strokeWidth={1.7} />
                  <span className="lk-sidebar-nav-label">{label}</span>
                  {badge && (
                    <span className="lk-sidebar-nav-badge">
                      {badge}
                    </span>
                  )}
                  {isLocked && <Lock size={12} className="lk-sidebar-lock-icon" />}
                  {isTourTarget && (
                    <span className="lk-sidebar-tour-dot" />
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
        <img src="/logo.png" alt="Le Koulis" className="lk-sidebar-logo-img" />
      </div>

      {/* Restaurant card */}
      {restaurantName && (
        <div className="lk-sidebar-restaurant-wrap">
          <div className="lk-sidebar-restaurant-card">
            <Avatar name={restaurantName} size={32} />
            <div className="lk-sidebar-restaurant-info">
              <div className="lk-sidebar-restaurant-name">
                {restaurantName}
              </div>
              <div className="lk-sidebar-restaurant-status">
                <span className="lk-sidebar-status-dot" />
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
        <div className="mt-auto lk-sidebar-footer">
          {/* Agent IA promo */}
          <div className="lk-sidebar-promo">
            <Sparkles size={16} className="lk-sidebar-promo-icon" />
            <div>
              <div className="lk-sidebar-promo-title">
                Agent IA
              </div>
              <div className="lk-sidebar-promo-subtitle">
                Bientot disponible
              </div>
            </div>
          </div>

          <div className="divider lk-sidebar-divider" />

          {/* User */}
          <div className="lk-sidebar-user">
            <Avatar name={userEmail} size={28} />
            <span className="lk-sidebar-user-email">
              {userEmail}
            </span>
          </div>

          <button
            className="nav-item lk-sidebar-logout-btn"
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
