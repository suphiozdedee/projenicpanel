
import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSupabaseConnection } from '@/lib/supabaseClientValidator';
import { isOnline } from '@/lib/networkUtils';

const SupabaseHealthContext = createContext(null);

export const SupabaseHealthProvider = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState('checking'); // checking, healthy, error, offline
  const [errorDetails, setErrorDetails] = useState(null);

  const checkHealth = async () => {
    if (!isOnline()) {
      setHealthStatus('offline');
      return;
    }

    setHealthStatus('checking');
    const result = await validateSupabaseConnection();
    
    if (result.success) {
      setHealthStatus('healthy');
      setErrorDetails(null);
    } else {
      setHealthStatus('error');
      setErrorDetails(result);
    }
  };

  useEffect(() => {
    checkHealth();
    
    const interval = setInterval(() => {
        // Periodic background check every 2 mins
        if (healthStatus !== 'checking') {
             // Only perform lightweight check if we aren't already hard checking
             if (isOnline()) validateSupabaseConnection().then(res => {
                 if (!res.success && healthStatus === 'healthy') {
                     setHealthStatus('error');
                     setErrorDetails(res);
                 } else if (res.success && healthStatus === 'error') {
                     setHealthStatus('healthy');
                     setErrorDetails(null);
                 }
             });
        }
    }, 120000);

    const handleOnline = () => checkHealth();
    window.addEventListener('online', handleOnline);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <SupabaseHealthContext.Provider value={{ healthStatus, errorDetails, checkHealth }}>
      {children}
    </SupabaseHealthContext.Provider>
  );
};

export const useSupabaseHealth = () => {
  const context = useContext(SupabaseHealthContext);
  if (!context) {
    throw new Error('useSupabaseHealth must be used within a SupabaseHealthProvider');
  }
  return context;
};
