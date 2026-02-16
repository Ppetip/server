import { supabase, supabaseAdmin } from "@/lib/supabase";

export interface Submission {
    id?: number;
    grid?: string;
    file_path?: string;
    original_name?: string;
    hash: string;
    createdAt?: string;
}

// 1. Core Submission Functions
export const addSubmission = async (submission: Submission, ipHash?: string) => {
    const { data, error } = await supabaseAdmin
        .from('submissions')
        .insert({
            original_name: submission.original_name,
            file_path: submission.file_path,
            hash: ipHash, 
            metadata: {}
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
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('hash', ipHash);

    if (error) return false;
    return (count || 0) > 0;
};

export const hasFileSubmitted = async (filename: string): Promise<boolean> => {
    const { count, error } = await supabaseAdmin
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('original_name', filename);

    if (error) return false;
    return (count || 0) > 0;
};

// 2. Stats Functions
export const getStats = async () => {
    const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true });

    const { data: recent } = await supabase
        .from('submissions')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);

    return {
        count: count || 0,
        recent: recent || []
    };
};

// 3. Admin Config Functions
export const getAdminConfig = async () => {
    const { data, error } = await supabaseAdmin
        .from('admin_config')
        .select('value')
        .eq('key', 'main')
        .single();

    if (data) return data.value;
    return { donationGoal: 20000, donationCurrent: 0, donationLink: "" };
};

export const updateAdminConfig = async (newConfig: any) => {
    const current = await getAdminConfig();
    const updated = { ...current, ...newConfig };

    const { error } = await supabaseAdmin
        .from('admin_config')
        .upsert({ key: 'main', value: updated });

    return !error;
};

export const getAdminIp = async (): Promise<string | null> => {
    const config = await getAdminConfig();
    return config.adminIp || null;
};

export const setAdminIp = async (ipHash: string) => {
    const config = await getAdminConfig();
    config.adminIp = ipHash;
    await updateAdminConfig(config);
};

export const resetSystem = async () => {
    await supabaseAdmin.from('submissions').delete().neq('id', 0);
    return true;
};
