import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { activateWidget } from '../lib/api';

// ─── Tour Step Definition ────────────────────────────────────────────────────

export interface TourStep {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly icon: 'tables' | 'hours' | 'widget' | 'activate';
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    path: '/dashboard/floorplan',
    title: 'Créez vos tables',
    description:
      'Commencez par définir vos tables et leur capacité. Le système assignera automatiquement la meilleure table disponible à chaque réservation.',
    icon: 'tables',
  },
  {
    path: '/dashboard/hours',
    title: 'Définissez vos horaires',
    description:
      'Indiquez les jours et créneaux pendant lesquels vos clients peuvent réserver. Vous pouvez avoir plusieurs services par jour (brunch, déjeuner…).',
    icon: 'hours',
  },
  {
    path: '/dashboard/widget',
    title: 'Découvrez votre widget',
    description:
      "Votre widget de réservation est prêt. Personnalisez son apparence puis copiez le code pour l'intégrer à votre site web.",
    icon: 'widget',
  },
  {
    path: '/dashboard',
    title: 'Activez les réservations !',
    description:
      'Tout est configuré. Activez maintenant votre système de réservation pour commencer à recevoir des clients.',
    icon: 'activate',
  },
] as const;

const STORAGE_KEY = 'lk_tour_step';
const STORAGE_COMPLETED = 'lk_tour_completed';

// ─── Context ─────────────────────────────────────────────────────────────────

interface TourContextValue {
  readonly isActive: boolean;
  readonly currentStep: number;
  readonly step: TourStep;
  readonly totalSteps: number;
  readonly progress: number;
  nextStep: () => void;
  skipTour: () => void;
  completeTour: () => Promise<void>;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within OnboardingTourProvider');
  return ctx;
}

/** Safe accessor — returns null outside of provider scope. */
export function useTourSafe(): TourContextValue | null {
  return useContext(TourContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ProviderProps {
  children: ReactNode;
  shouldActivate: boolean;
  onComplete: () => void;
}

export function OnboardingTourProvider({ children, shouldActivate, onComplete }: ProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const wasCompleted = localStorage.getItem(STORAGE_COMPLETED) === '1';

  const [isActive, setIsActive] = useState(() => shouldActivate && !wasCompleted);

  const [currentStep, setCurrentStep] = useState(() => {
    if (!shouldActivate || wasCompleted) return 0;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(parseInt(saved, 10), TOUR_STEPS.length - 1) : 0;
  });

  // Ref-based navigation to avoid re-trigger loops
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    const target = TOUR_STEPS[currentStep].path;

    if (location.pathname !== target && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate(target, { replace: true });
    } else {
      // Reset flag when location has settled
      hasNavigated.current = false;
    }
  }, [isActive, currentStep, navigate, location.pathname]);

  // Persist step to localStorage
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(STORAGE_KEY, String(currentStep));
    }
  }, [currentStep, isActive]);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      hasNavigated.current = false;
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const finishTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_COMPLETED, '1');
    localStorage.removeItem(STORAGE_KEY);
    onComplete();
  }, [onComplete]);

  const skipTour = useCallback(() => {
    finishTour();
    navigate('/dashboard', { replace: true });
  }, [finishTour, navigate]);

  const completeTour = useCallback(async () => {
    try {
      await activateWidget();
    } catch {
      // Widget may already be active — continue silently
    }
    finishTour();
    navigate('/dashboard', { replace: true });
  }, [finishTour, navigate]);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <TourContext.Provider
      value={{ isActive, currentStep, step, totalSteps: TOUR_STEPS.length, progress, nextStep, skipTour, completeTour }}
    >
      {children}
    </TourContext.Provider>
  );
}
