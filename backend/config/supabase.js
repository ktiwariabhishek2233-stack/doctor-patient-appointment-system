import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseClient = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from environment variables.');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
};

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseServiceKey);
