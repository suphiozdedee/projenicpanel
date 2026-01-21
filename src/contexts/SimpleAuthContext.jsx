
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as simpleAuth from '@/lib/simpleAuth';
import { useToast } from '@/components/ui/use-toast';

const SimpleAuthContext = createContext(undefined);

export const SimpleAuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
          // Simple auth is local storage based, so it shouldn't fail due to network
          // But we wrap in try/catch just in case
          const savedUser = simpleAuth.getSession();
          if (savedUser) {
            setUser(savedUser);
          }
      } catch (err) {
          console.error("SimpleAuth init failed", err);
      } finally {
          setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const result = await simpleAuth.login(username, password);
      if (result.success) {
        setUser(result.user);
        return { data: result.user, error: null };
      } else {
        return { data: null, error: { message: result.error } };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { data: null, error: { message: "An unexpected error occurred" } };
    }
  };

  const logout = async () => {
    try {
      await simpleAuth.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again.",
      });
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, loading]);

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
