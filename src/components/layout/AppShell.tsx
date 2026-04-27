import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyConfig } from '../../lib/api';
import { getMyPlace } from '../../lib/backendApi';
import { OnboardingTourProvider } from '../../contexts/OnboardingTourContext';
import { TourBanner } from './TourBanner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CreateReservationModal } from '../ui/CreateReservationModal';

// ─── Dashboard Inner Shell ───────────────────────────────────────────────────

interface AppShellInnerProps {
  restaurantName: string;
  hasLinkedPlace: boolean;
}

function AppShellInner({ restaurantName, hasLinkedPlace }: AppShellInnerProps) {
  const { user, supabase } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newResaOpen, setNewResaOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'global' });

    const hostname = window.location.hostname;
    let mainAppUrl: string;
    if (hostname === 'localhost') {
      mainAppUrl = 'http://localhost:4200';
    } else if (hostname.includes('staging')) {
      mainAppUrl = 'https://staging.lakreme.fr';
    } else {
      mainAppUrl = 'https://lakreme.fr';
    }
    window.location.href = `${mainAppUrl}/auth/login`;
  };

  return (
    <div className="app-shell">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <Sidebar
        restaurantName={restaurantName}
        userEmail={user?.email ?? ''}
        hasLinkedPlace={hasLinkedPlace}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Topbar
          restaurantName={restaurantName}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          onNewResa={() => setNewResaOpen(true)}
        />

        <main className="page-content">
          <TourBanner />
          <Outlet />
        </main>
      </div>

      <CreateReservationModal
        open={newResaOpen}
        onClose={() => setNewResaOpen(false)}
      />
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
        const config = await getMyConfig();

        if (config.restaurant_name) {
          setRestaurantName(config.restaurant_name);
          localStorage.setItem('lk_restaurant_name', config.restaurant_name);
        }

        if (!config.is_active) {
          setShouldActivateTour(true);
        }

        try {
          await getMyPlace();
          setHasLinkedPlace(true);
        } catch {
          setHasLinkedPlace(false);
        }
      } catch {
        setShouldActivateTour(true);
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={24} style={{ color: 'var(--lk-primary)', animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: 'var(--lk-text-muted)', fontSize: 'var(--fs-base)' }}>Chargement...</span>
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
