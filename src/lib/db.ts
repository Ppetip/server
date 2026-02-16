// src/lib/db.ts
import { supabase, supabaseAdmin } from "@/lib/supabase";

/**
 * Keep this type aligned with what your API actually uses.
 * Supabase rows may contain more fields, but this is the shape your app cares about.
 */
export interface Submission {
  id?: number;
  grid?: string;
  file_path?: string;
  original_name?: string;
  hash?: string | null;        // can be null/undefined depending on inserts + DB
  createdAt?: string | null;   // stored as string (or null) in your current code
}

export type StatsResult = {
  count: number;
  recent: Submission[];
};

// 1) Core Submission Functions
export const addSubmission = async (submission: Submission, ipHash?: string) => {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .insert({
      original_name: submission.original_name ?? null,
      file_path: submission.file_path ?? null,
      hash: ipHash ?? null,
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase Add Error:", error);
    throw error;
  }

  return data;
};

export const hasIpSubmitted = async (ipHash: string): Promise<boolean> => {
  const { count, error } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("hash", ipHash);

  if (error) return false;
  return (count || 0) > 0;
};

export const hasFileSubmitted = async (filename: string): Promise<boolean> => {
  const { count, error } = await supabaseAdmin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("original_name", filename);

  if (error) return false;
  return (count || 0) > 0;
};

// 2) Stats Functions
export const getStats = async (): Promise<StatsResult> => {
  const { count, error: countError } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Supabase Count Error:", countError);
    throw countError;
  }

  const { data: recent, error: recentError } = await supabase
    .from("submissions")
    .select("*")
    .order("id", { ascending: false })
    .limit(50);

  if (recentError) {
    console.error("Supabase Recent Error:", recentError);
    throw recentError;
  }

  // Key: force recent to be a typed array so `.map(s => ...)` isn't implicit-any
  return {
    count: count || 0,
    recent: (recent ?? []) as Submission[],
  };
};

// 3) Admin Config Functions
export type AdminConfig = {
  donationGoal: number;
  donationCurrent: number;
  donationLink: string;
  adminIp?: string | null;
};

export const getAdminConfig = async (): Promise<AdminConfig> => {
  const { data, error } = await supabaseAdmin
    .from("admin_config")
    .select("value")
    .eq("key", "main")
    .single();

  if (error) {
    // If the row doesn't exist yet, return defaults
    return { donationGoal: 20000, donationCurrent: 0, donationLink: "" };
  }

  // Your table stores config inside `value`
  if (data?.value) return data.value as AdminConfig;

  return { donationGoal: 20000, donationCurrent: 0, donationLink: "" };
};

export const updateAdminConfig = async (newConfig: Partial<AdminConfig>) => {
  const current = await getAdminConfig();
  const updated: AdminConfig = { ...current, ...newConfig };

  const { error } = await supabaseAdmin
    .from("admin_config")
    .upsert({ key: "main", value: updated });

  return !error;
};

export const getAdminIp = async (): Promise<string | null> => {
  const config = await getAdminConfig();
  return config.adminIp ?? null;
};

export const setAdminIp = async (ipHash: string) => {
  await updateAdminConfig({ adminIp: ipHash });
};

export const resetSystem = async () => {
  const { error } = await supabaseAdmin.from("submissions").delete().neq("id", 0);
  if (error) {
    console.error("Supabase Reset Error:", error);
    throw error;
  }
  return true;
};
