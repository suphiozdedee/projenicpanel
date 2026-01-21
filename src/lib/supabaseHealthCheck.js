import { supabase } from './customSupabaseClient';
import { connectionManager } from './supabaseConnectionManager';

export const runHealthCheck = async () => {
  const diagnostics = {
    env: {
      url: !!import.meta.env.VITE_SUPABASE_URL,
      key: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    },
    connection: false,
    auth: false,
    rls: false,
    latency: 0,
    timestamp: new Date().toISOString()
  };

  console.group('🔍 Supabase Health Check');

  try {
    // 1. Basic Connectivity & Latency
    const start = performance.now();
    const { error: connError } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    diagnostics.latency = Math.round(performance.now() - start);
    
    if (connError && connError.message !== 'Failed to fetch') {
      // 401s or RLS errors still mean we "connected" to the server
      diagnostics.connection = true;
    } else if (!connError) {
      diagnostics.connection = true;
    }

    // 2. Auth State
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    diagnostics.auth = !!session && !authError;

    // 3. RLS / Policy Check
    if (diagnostics.auth) {
        // Try to read a profile - should work if RLS allows
        const { error: rlsError } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        diagnostics.rls = !rlsError;
    }

    console.table(diagnostics);
    
    // Log findings to connection manager
    if (diagnostics.connection) {
        connectionManager.notifyListeners(true);
    } else {
        console.warn('⚠️ Connection Check Failed');
    }

  } catch (err) {
    console.error('❌ Health Check Critical Failure:', err);
  } finally {
    console.groupEnd();
  }

  return diagnostics;
};