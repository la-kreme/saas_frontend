import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Auth
import LoginRedirect from './pages/auth/LoginRedirect';

// Onboarding
import { OnboardingLayout } from './pages/onboarding/OnboardingLayout';
import Step1Link from './pages/onboarding/Step1Link';
import Step2Tables from './pages/onboarding/Step2Tables';
import Step3Hours from './pages/onboarding/Step3Hours';
import Step4Customize from './pages/onboarding/Step4Customize';
import Step5Widget from './pages/onboarding/Step5Widget';

// Dashboard
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import Today from './pages/dashboard/Today';
import Reservations from './pages/dashboard/Reservations';
import Widget from './pages/dashboard/Widget';
import Settings from './pages/dashboard/Settings';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Si pas connecté → redirect vers lakreme.fr pour login
  if (!user) return <Navigate to="/login" replace />;
  // TODO : vérifier si onboarding complété (widget_config existe)
  // Pour Sprint 1 : on redirige vers onboarding/link par défaut
  return <Navigate to="/onboarding/link" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="lk-bg-mesh" />
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Auth */}
        <Route path="/login" element={<LoginRedirect />} />

        {/* Onboarding (protégé) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding/link"      element={<Step1Link />} />
            <Route path="/onboarding/tables"    element={<Step2Tables />} />
            <Route path="/onboarding/hours"     element={<Step3Hours />} />
            <Route path="/onboarding/customize" element={<Step4Customize />} />
            <Route path="/onboarding/widget"    element={<Step5Widget />} />
          </Route>
        </Route>

        {/* Dashboard (protégé) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard"              element={<Today />} />
            <Route path="/dashboard/reservations" element={<Reservations />} />
            <Route path="/dashboard/widget"       element={<Widget />} />
            <Route path="/dashboard/settings"     element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
