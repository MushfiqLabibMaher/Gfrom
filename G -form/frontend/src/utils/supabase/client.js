import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_PUBLISHABLE_KEY in environment variables'
  );
}

/**
 * Browser-side Supabase client.
 * Uses the publishable (anon/public) key — safe to expose in the browser.
 * For privileged operations (bypassing RLS) use the backend service role client.
 */
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
