import { useLocation } from 'react-router-dom';

const STEP_MAP: Record<string, number> = {
  '/onboarding/link':      0,
  '/onboarding/tables':    1,
  '/onboarding/hours':     2,
  '/onboarding/customize': 3,
  '/onboarding/widget':    4,
};

export function useOnboardingStep(): number {
  const { pathname } = useLocation();
  return STEP_MAP[pathname] ?? 0;
}
