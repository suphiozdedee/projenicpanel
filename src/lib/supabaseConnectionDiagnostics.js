
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Comprehensive Supabase Connection Diagnostics
 */
export const runDiagnostics = async () => {
  const results = {
    clientInit: false,
    apiKeyConfig: false,
    networkReachable: false,
    tables: {
      profiles: null,
      projects: null,
      fairs: null,
      customers: null
    },
    latency: 0,
    timestamp: new Date().toISOString(),
    overallStatus: 'pending' // pending, success, warning, failure
  };

  const startTime = performance.now();

  try {
    // 1. Client Initialization Check
    if (!supabase) {
        results.overallStatus = 'failure';
        results.fatalError = "Supabase client is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.";
        console.error(results.fatalError);
        return results;
    }

    // If we got here, client exists
    results.clientInit = true;
    results.apiKeyConfig = true; 

    // 2. Basic Network & Table Check (Profiles)
    // Using HEAD request for minimal data transfer
    const profilesCheck = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (profilesCheck.error) {
      results.tables.profiles = { status: 'error', error: profilesCheck.error.message };
      // If profiles fail, it's likely a auth/network/key issue
    } else {
      results.tables.profiles = { status: 'ok', count: profilesCheck.count };
      results.networkReachable = true;
    }

    // 3. Projects Check
    const projectsCheck = await supabase.from('projects').select('count', { count: 'exact', head: true });
    results.tables.projects = projectsCheck.error 
      ? { status: 'error', error: projectsCheck.error.message }
      : { status: 'ok', count: projectsCheck.count };

    // 4. Fairs Check
    const fairsCheck = await supabase.from('fairs').select('count', { count: 'exact', head: true });
    results.tables.fairs = fairsCheck.error 
      ? { status: 'error', error: fairsCheck.error.message }
      : { status: 'ok', count: fairsCheck.count };

    // 5. Customers Check
    const customersCheck = await supabase.from('customers').select('count', { count: 'exact', head: true });
    results.tables.customers = customersCheck.error 
      ? { status: 'error', error: customersCheck.error.message }
      : { status: 'ok', count: customersCheck.count };

    // Calculate Latency
    results.latency = Math.round(performance.now() - startTime);

    // Determine Overall Status
    const errors = Object.values(results.tables).filter(t => t?.status === 'error');
    if (errors.length === 0 && results.networkReachable) {
      results.overallStatus = 'success';
    } else if (errors.length < 4 && results.networkReachable) {
      results.overallStatus = 'warning';
    } else {
      results.overallStatus = 'failure';
    }

  } catch (err) {
    console.error("Diagnostic Fatal Error:", err);
    results.overallStatus = 'failure';
    results.fatalError = err.message;
  }

  console.group('Supabase Diagnostics Report');
  console.log('Status:', results.overallStatus);
  console.log('Latency:', results.latency + 'ms');
  console.table(results.tables);
  console.groupEnd();

  return results;
};
