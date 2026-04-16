import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean;       // alias de isLoading pour compatibilité
  supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  loading: true,
  supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Detect hash tokens BEFORE any async work.
    // When the Angular frontend redirects here with #access_token=...,
    // the Supabase SDK will process the hash via detectSessionInUrl.
    // But getSession() reads cookies that DON'T EXIST YET on this domain —
    // it returns null, causing a premature redirect to /login.
    // Fix: skip getSession() when hash tokens are present and let
    // onAuthStateChange handle it (it fires AFTER hash processing).
    const hasHashTokens = window.location.hash.includes('access_token=');

    const initSession = async () => {
      if (hasHashTokens) {
        // Don't call getSession() — let onAuthStateChange handle it below.
        // isLoading stays true until onAuthStateChange fires.
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error('[AuthContext] Error getting session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, newSession: Session | null) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    // Safety timeout: if onAuthStateChange never fires (e.g. invalid tokens),
    // stop loading after 5s to avoid infinite spinner.
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (hasHashTokens) {
      timeout = setTimeout(() => {
        if (mounted) setIsLoading(false);
      }, 5000);
    }

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, loading: isLoading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
