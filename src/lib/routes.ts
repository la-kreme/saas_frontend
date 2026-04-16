// ─── Route Constants ──────────────────────────────────────────────────────────
// Typed route paths to prevent typos in navigate() calls.

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',

  // Onboarding
  ONBOARDING_LINK: '/onboarding/link',
  ONBOARDING_TABLES: '/onboarding/tables',
  ONBOARDING_HOURS: '/onboarding/hours',
  ONBOARDING_CUSTOMIZE: '/onboarding/customize',
  ONBOARDING_WIDGET: '/onboarding/widget',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_MY_PAGE: '/dashboard/my-page',
  DASHBOARD_RESERVATIONS: '/dashboard/reservations',
  DASHBOARD_TABLES: '/dashboard/tables',
  DASHBOARD_HOURS: '/dashboard/hours',
  DASHBOARD_WIDGET: '/dashboard/widget',
  DASHBOARD_SETTINGS: '/dashboard/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
