// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

// Lazy singleton so importing the file doesn't instantly explode during build
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function supabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  _supabase = createClient(url, anon);
  return _supabase;
}

export function supabaseAdminClient(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!service) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");

  _supabaseAdmin = createClient(url, service);
  return _supabaseAdmin;
}

// Backwards-compatible exports (so your current db.ts import still works)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (supabaseClient() as any)[prop];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (supabaseAdminClient() as any)[prop];
  },
});
