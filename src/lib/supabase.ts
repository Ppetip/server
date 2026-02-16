import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail-safe check to prevent build-time crashes
if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing. This is expected during some build phases but will fail at runtime.");
}

// Client for public access (Anon)
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Client for admin access (Service Role)
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');
