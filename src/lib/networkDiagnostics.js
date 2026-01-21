
import { supabase } from './customSupabaseClient';

export const runNetworkDiagnostics = async () => {
  const results = {
    online: false,
    supabaseConnection: false,
    envVars: false,
    apiLatency: null,
    timestamp: new Date().toISOString()
  };

  // 1. Browser Online Status
  results.online = navigator.onLine;

  // 2. Env Vars Check
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  results.envVars = !!url && !!key;

  if (!results.online) {
    return results;
  }

  // 3. Supabase Connectivity & Latency
  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const end = performance.now();
    
    if (!error) {
      results.supabaseConnection = true;
      results.apiLatency = Math.round(end - start);
    } else {
      console.error("Diagnostic Supabase Error:", error);
    }
  } catch (err) {
    console.error("Diagnostic Fetch Error:", err);
  }

  // 4. SSL Check (Implicit via Fetch)
  // If fetch succeeded, SSL is likely fine. If failed with specific error, we'd see it in console.

  return results;
};
