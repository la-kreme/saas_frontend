import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Code2, Settings as SettingsIcon,
  LogOut, Zap, LayoutGrid, Clock, Globe, Lock, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyConfig } from '../../lib/api';
import { getMyPlace } from '../../lib/backendApi';
import { OnboardingTourProvider, useTourSafe, TOUR_STEPS } from '../../contexts/OnboardingTourContext';
import { TourBanner } from './TourBanner';

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly end?: boolean;
  readonly requiresLinkedPlace?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: "Aujourd'hui", icon: LayoutDashboard, end: true },
  { to: '/dashboard/reservations', label: 'Réservations', icon: CalendarDays },
  { to: '/dashboard/tables', label: 'Tables', icon: LayoutGrid },
  { to: '/dashboard/hours', label: 'Horaires', icon: Clock },
  { to: '/dashboard/widget', label: 'Mon Widget', icon: Code2 },
  { to: '/dashboard/my-page', label: 'Ma page LK', icon: Globe, requiresLinkedPlace: true },
  { to: '/dashboard/settings', label: 'Paramètres', icon: SettingsIcon },
];

// ─── Sidebar Navigation (Tour-aware) ─────────────────────────────────────────

function SidebarNav({ hasLinkedPlace }: { hasLinkedPlace: boolean }) {
  const tour = useTourSafe();
  const location = useLocation();
  const tourTargetPath = tour?.isActive ? TOUR_STEPS[tour.currentStep].path : null;

  return (
    <>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, requiresLinkedPlace }) => {
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
            onClick={(e) => { if (isDisabled) e.preventDefault(); }}
            style={{
              opacity: isLocked || isTourDimmed ? 0.4 : 1,
              filter: isLocked ? 'grayscale(1)' : 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              position: 'relative',
            }}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {isLocked && <Lock size={12} style={{ opacity: 0.7 }} />}
            {isTourTarget && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--lk-purple-light)',
                animation: 'pulse 1.5s ease-in-out infinite',
                flexShrink: 0,
              }} />
            )}
          </NavLink>
        );
      })}
    </>
  );
}

// ─── Dashboard Inner Shell ───────────────────────────────────────────────────

interface AppShellInnerProps {
  restaurantName: string;
  hasLinkedPlace: boolean;
}

function AppShellInner({ restaurantName, hasLinkedPlace }: AppShellInnerProps) {
  const { user, supabase } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'https://lakreme.fr';
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="La Krème" style={{ height: '36px', width: 'auto' }} />
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Dashboard</span>
          <SidebarNav hasLinkedPlace={hasLinkedPlace} />

          <div className="mt-auto" style={{ paddingTop: '32px' }}>
            <div className="divider" />
            <div style={{
              padding: '12px',
              fontSize: '12px',
              color: 'var(--lk-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.email}
            </div>
            <button
              className="nav-item"
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="font-semibold text-sm" style={{ color: 'var(--lk-text-primary)' }}>
            {restaurantName || 'Mon Restaurant'}
          </div>
          <span className="badge badge-active" style={{ fontSize: '11px' }}>
            <Zap size={10} />
            Beta
          </span>
        </header>

        <main className="page-content">
          <TourBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Root AppShell (single fetch, provides tour context) ─────────────────────

export function AppShell() {
  const [restaurantName, setRestaurantName] = useState(
    () => localStorage.getItem('lk_restaurant_name') ?? ''
  );
  const [hasLinkedPlace, setHasLinkedPlace] = useState(false);
  const [shouldActivateTour, setShouldActivateTour] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Single fetch — used for both tour activation and restaurant name
        const config = await getMyConfig();

        if (config.restaurant_name) {
          setRestaurantName(config.restaurant_name);
          localStorage.setItem('lk_restaurant_name', config.restaurant_name);
        }

        if (!config.is_active) {
          setShouldActivateTour(true);
        }

        // SaaS Profile sync (best-effort)
        try {
          await getMyPlace();
          setHasLinkedPlace(true);
        } catch {
          setHasLinkedPlace(false);
        }
      } catch {
        // No config = new user → activate tour
        setShouldActivateTour(true);
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px' }}>
        <Loader2 size={24} style={{ color: 'var(--lk-purple-light)', animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: 'var(--lk-text-muted)', fontSize: '14px' }}>Chargement…</span>
      </div>
    );
  }

  return (
    <OnboardingTourProvider
      shouldActivate={shouldActivateTour}
      onComplete={() => setShouldActivateTour(false)}
    >
      <AppShellInner restaurantName={restaurantName} hasLinkedPlace={hasLinkedPlace} />
    </OnboardingTourProvider>
  );
}
