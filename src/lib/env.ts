/**
 * Accès centralisé aux variables d'environnement Vite.
 * En local : lues depuis .env.local
 * En Docker (Railway) : bakées au build via ARG → ENV → Vite
 *
 * .replace(/\/+$/, '') strips trailing slashes to prevent double-slash 404s
 * (e.g. https://api.example.com//api/v1/...) when env vars end with '/'.
 */
const strip = (url: string) => url.replace(/\/+$/, '');

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  apiUrl: strip(import.meta.env.VITE_API_URL || 'http://localhost:8005'),
  widgetBaseUrl: strip(import.meta.env.VITE_WIDGET_BASE_URL || 'http://localhost:8005'),
  meilleurbrunchApiUrl: strip(import.meta.env.VITE_MEILLEURBRUNCH_API_URL || 'http://localhost:8000'),
};
