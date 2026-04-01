import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// We dynamically determine the cookie domain. In local dev without lakreme.fr, we don't set the domain.
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const cookieDomain = isLocalhost ? undefined : '.lakreme.fr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem(key: string) {
        // Read cookie
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      },
      setItem(key: string, value: string) {
        // Write cookie
        if (typeof document === 'undefined') return;
        const domainStr = cookieDomain ? `; domain=${cookieDomain}` : '';
        // SameSite=Lax allows the cookie to be sent when navigating from lakreme.fr to app.lakreme.fr
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/${domainStr}; max-age=31536000; SameSite=Lax; Secure`;
      },
      removeItem(key: string) {
        // Remove cookie
        if (typeof document === 'undefined') return;
        const domainStr = cookieDomain ? `; domain=${cookieDomain}` : '';
        document.cookie = `${key}=; path=/${domainStr}; max-age=0; SameSite=Lax; Secure`;
      }
    },
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true
  }
});
