import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}


// Cookie domain: .lakreme.app couvre staging.lakreme.app ET lakreme.app
// NOTE: .lakreme.fr (Angular) et .lakreme.app (SaaS) partagent le même cookie domain
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const cookieDomain = isLocalhost ? undefined : '.lakreme.app';
const secureFlag = isLocalhost ? '' : '; Secure';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem(key: string) {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        if (!match) return null;
        
        const val = match[2];
        if (val === 'chunked') {
            let fullVal = '';
            let i = 0;
            while (true) {
                const chunkMatch = document.cookie.match(new RegExp('(^| )' + key + '\\.' + i + '=([^;]+)'));
                if (!chunkMatch) break;
                fullVal += chunkMatch[2];
                i++;
            }
            return decodeURIComponent(fullVal);
        }
        return decodeURIComponent(val);
      },
      setItem(key: string, value: string) {
        if (typeof document === 'undefined') return;
        const domainStr = cookieDomain ? `; domain=${cookieDomain}` : '';
        const encoded = encodeURIComponent(value);
        const chunkSize = 3000;

        document.cookie = `${key}=; path=/${domainStr}; max-age=0; SameSite=Lax${secureFlag}`;
        for (let i = 0; i < 10; i++) {
            document.cookie = `${key}.${i}=; path=/${domainStr}; max-age=0; SameSite=Lax${secureFlag}`;
        }

        if (encoded.length <= chunkSize) {
            document.cookie = `${key}=${encoded}; path=/${domainStr}; max-age=31536000; SameSite=Lax${secureFlag}`;
        } else {
            const chunksCount = Math.ceil(encoded.length / chunkSize);
            document.cookie = `${key}=chunked; path=/${domainStr}; max-age=31536000; SameSite=Lax${secureFlag}`;
            for (let i = 0; i < chunksCount; i++) {
                const chunk = encoded.substring(i * chunkSize, (i + 1) * chunkSize);
                document.cookie = `${key}.${i}=${chunk}; path=/${domainStr}; max-age=31536000; SameSite=Lax${secureFlag}`;
            }
        }
      },
      removeItem(key: string) {
        if (typeof document === 'undefined') return;
        const domainStr = cookieDomain ? `; domain=${cookieDomain}` : '';
        document.cookie = `${key}=; path=/${domainStr}; max-age=0; SameSite=Lax${secureFlag}`;
        for (let i = 0; i < 10; i++) {
            document.cookie = `${key}.${i}=; path=/${domainStr}; max-age=0; SameSite=Lax${secureFlag}`;
        }
      }
    },
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true
  }
});
