import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Code2,
  Settings,
  LogOut,
  Zap,
  LayoutGrid,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyConfig } from '../../lib/api';
import { getMyPlace } from '../../lib/backendApi';
import { SetupWizard } from './SetupWizard';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  requiresLinkedPlace?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: "Aujourd'hui", icon: LayoutDashboard, end: true },
  { to: '/dashboard/reservations', label: 'Réservations', icon: CalendarDays },
  { to: '/dashboard/tables', label: 'Tables', icon: LayoutGrid },
  { to: '/dashboard/hours', label: 'Horaires', icon: Clock },
  { to: '/dashboard/widget', label: 'Mon Widget', icon: Code2 },
  { to: '/dashboard/my-page', label: 'Ma page LK', icon: Globe, requiresLinkedPlace: true },
  { to: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export function AppShell() {
  const { user, supabase } = useAuth();
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [hasLinkedPlace, setHasLinkedPlace] = useState(false);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(true);

  useEffect(() => {
    const cachedName = localStorage.getItem('lk_restaurant_name');
    if (cachedName) setRestaurantName(cachedName);

    const initDashboard = async () => {
      try {
        // 1. Fetch widget config first
        const config = await getMyConfig();
        if (config.restaurant_name) {
          setRestaurantName(config.restaurant_name);
          localStorage.setItem('lk_restaurant_name', config.restaurant_name);
        }
        if (!config.is_active) {
          setHasCompletedWizard(false);
        }

        // 2. Fetch or Sync SaaS Profile
        try {
          await getMyPlace();
          setHasLinkedPlace(true);
        } catch (error) {
          setHasLinkedPlace(false);
        }
      } catch (err) {
        /* silencieux si non connecté ou pas de config */
        setHasLinkedPlace(false);
      }
    };

    initDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'https://lakreme.fr';
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="La Krème" style={{ height: '36px', width: 'auto' }} />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Dashboard</span>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, requiresLinkedPlace }) => {
            const isLocked = requiresLinkedPlace && !hasLinkedPlace;
            
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                style={{
                  opacity: isLocked ? 0.6 : 1,
                  filter: isLocked ? 'grayscale(1)' : 'none',
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {isLocked && <Lock size={12} style={{ opacity: 0.7 }} />}
              </NavLink>
            );
          })}

          {/* Spacer + Logout */}
          <div className="mt-auto" style={{ paddingTop: '32px' }}>
            <div className="divider" />
            <div style={{
              padding: '12px 12px',
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
          <div className="font-semibold text-sm" style={{ color: 'var(--lk-text-main)' }}>
            {restaurantName || 'Mon Restaurant'}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="badge badge-active"
              style={{ fontSize: '11px' }}
            >
              <Zap size={10} />
              Beta
            </span>
          </div>
        </header>
        {/* ── Main Content ── */}
        <main className="page-content">
          <Outlet />
        </main>

        {!hasCompletedWizard && hasLinkedPlace && (
          <SetupWizard onComplete={() => setHasCompletedWizard(true)} />
        )}
      </div>
    </div>
  );
}
