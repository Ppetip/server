import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create clients if we have a URL, otherwise export a proxy or null 
// to prevent the SDK from throwing "URL is required" during the Vercel build.
export const supabase = supabaseUrl 
    ? createClient(supabaseUrl, supabaseKey!) 
    : (null as any);

export const supabaseAdmin = supabaseUrl 
    ? createClient(supabaseUrl, supabaseServiceKey!) 
    : (null as any);
