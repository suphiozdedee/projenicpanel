import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { isOnline } from '@/lib/networkUtils';
import { connectionManager } from '@/lib/supabaseConnectionManager';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Centralized session handler
  const handleSession = useCallback((currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Start monitoring connection health
    if (connectionManager && typeof connectionManager.startMonitoring === 'function') {
        connectionManager.startMonitoring();
    }

    const initAuth = async () => {
      try {
        if (!supabase) {
            console.error("Supabase client not initialized");
            if (mounted) setLoading(false);
            return;
        }

        // Initial session check
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          // If 401 or invalid refresh token, we clear session
          if (error.message.includes('Invalid Refresh Token') || error.status === 400) {
             console.warn('[Auth] Invalid session detected, clearing.');
             await supabase.auth.signOut();
             if (mounted) handleSession(null);
          } else {
             // For network errors during init, we might still have a persisted session in local storage
             // but we can't verify it. We'll assume logged out for safety or handle gracefully.
             console.error("[Auth] Session check error:", error);
             if (mounted) handleSession(null);
          }
        } else {
          if (mounted) handleSession(data.session);
        }
      } catch (error) {
        console.error("[Auth] Initialization critical error:", error);
        if (mounted) handleSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[Auth] Auth event: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        if (mounted) {
            setSession(null);
            setUser(null);
            // Clear any caches
            if (window.localStorage) {
                // Optional: clear app specific cache
            }
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (mounted) handleSession(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (connectionManager && typeof connectionManager.stopMonitoring === 'function') {
          connectionManager.stopMonitoring();
      }
    };
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    if (!isOnline()) {
        toast({ variant: "destructive", title: "Hata", description: "İnternet bağlantısı yok." });
        return { error: { message: "Offline" } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({ variant: "destructive", title: "Kayıt Başarısız", description: error.message });
    }
    return { data, error };
  }, [toast]);

  const signIn = useCallback(async ({ username, password }) => {
    if (!isOnline()) return { error: { message: "Offline" } };

    try {
      // Login via edge function for username support
      const { data, error } = await supabase.functions.invoke('authenticate-user', {
        body: { username, password }
      });

      if (error) throw new Error(error.message || 'Authentication failed');
      if (!data?.session) throw new Error(data?.error || 'Invalid credentials');
      
      const { error: sessionError } = await supabase.auth.setSession(data.session);
      if (sessionError) throw sessionError;

      return { data, error: null };
    } catch (err) {
      console.error("Login Error:", err);
      return { data: null, error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error("Sign out error:", error);
    } finally {
        // Force local cleanup anyway
        setSession(null);
        setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, initialized, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};