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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',              label: "Aujourd'hui",  icon: LayoutDashboard, end: true },
  { to: '/dashboard/reservations', label: 'Réservations', icon: CalendarDays },
  { to: '/dashboard/tables',       label: 'Tables',       icon: LayoutGrid },
  { to: '/dashboard/hours',        label: 'Horaires',     icon: Clock },
  { to: '/dashboard/widget',       label: 'Mon Widget',   icon: Code2 },
  { to: '/dashboard/settings',     label: 'Paramètres',   icon: Settings },
];

export function AppShell() {
  const { user, supabase } = useAuth();

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
          <div className="sidebar-logo-mark">LK</div>
          <span className="sidebar-logo-text">La Krème</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Dashboard</span>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

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
        <header className="topbar">
          <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
            <span
              className="badge badge-active"
              style={{ fontSize: '11px' }}
            >
              <Zap size={10} />
              Beta
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
