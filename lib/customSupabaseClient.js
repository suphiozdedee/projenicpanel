
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = '__SUPABASE_URL__';
const supabaseAnonKey = '__SUPABASE_ANON_KEY__';

let initError = null;
let isReady = false;

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Validate initialization
if (!supabaseUrl || supabaseUrl === '__SUPABASE_URL__') {
  initError = new Error('VITE_SUPABASE_URL environment variable is not set');
} else if (!supabaseAnonKey || supabaseAnonKey === '__SUPABASE_ANON_KEY__') {
  initError = new Error('VITE_SUPABASE_ANON_KEY environment variable is not set');
} else {
  isReady = true;
}

export const isSupabaseReady = () => isReady;

export const getSupabaseInitError = () => initError;

export default customSupabaseClient;

export { 
  customSupabaseClient,
  customSupabaseClient as supabase,
};
