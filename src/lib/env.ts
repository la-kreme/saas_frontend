/**
 * Accès centralisé aux variables d'environnement Vite.
 * En local : lues depuis .env.local
 * En Docker (Railway) : bakées au build via ARG → ENV → Vite
 */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8005',
  widgetBaseUrl: import.meta.env.VITE_WIDGET_BASE_URL || 'http://localhost:8005',
  meilleurbrunchApiUrl: import.meta.env.VITE_MEILLEURBRUNCH_API_URL || 'http://localhost:8000',
};
