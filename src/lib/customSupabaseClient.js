import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozgbwlomaauczmnsnsxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z2J3bG9tYWF1Y3ptbnNuc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzYyODcsImV4cCI6MjA4MjQxMjI4N30.9KuY3t4ZB2fMhQE4A1Ck5Dh6YhNS_PqAkzqPGHwUNoI';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
