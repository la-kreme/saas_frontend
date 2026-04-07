/**
 * Accès unifié aux variables d'environnement.
 * - En dev local : lit import.meta.env.VITE_* (Vite dev server)
 * - En Docker/Railway : lit window.__ENV injecté par entrypoint.sh au runtime
 */

interface AppEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_URL: string;
  VITE_WIDGET_BASE_URL: string;
}

declare global {
  interface Window {
    __ENV?: Partial<AppEnv>;
  }
}

function getEnv(key: keyof AppEnv, fallback = ''): string {
  // Runtime (Docker) → window.__ENV
  const runtimeVal = window.__ENV?.[key];
  if (runtimeVal) return runtimeVal;

  // Build time (Vite dev server) → import.meta.env
  const buildVal = (import.meta.env as Record<string, string>)[key];
  if (buildVal) return buildVal;

  return fallback;
}

export const env = {
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
  apiUrl: getEnv('VITE_API_URL', 'http://localhost:8005'),
  widgetBaseUrl: getEnv('VITE_WIDGET_BASE_URL', 'http://localhost:8005'),
};
