import { supabase, supabaseAdmin } from "@/lib/supabase";

export interface Submission {
    id?: number;
    grid?: string;
    file_path?: string;
    original_name?: string;
    hash: string;
    createdAt?: string;
}

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

    if (error) throw error;
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

// ... include your other exports (getStats, getAdminConfig, etc.) here
