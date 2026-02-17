import { supabase } from "./supabase";

export type AdminConfig = {
    donationGoal: number;
    donationCurrent: number;
    donationLink: string;
    countOffset: number;
};

export const getStats = async () => {
    const { count, error } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true });

    if (error) throw error;

    const config = await getAdminConfig();
    const realCount = count || 0;
    const fibbedCount = realCount + (config.countOffset || 0);

    return {
        realCount,
        fibbedCount,
        config
    };
};

export const getAdminConfig = async (): Promise<AdminConfig> => {
    const { data, error } = await supabase
        .from("admin_config")
        .select("value")
        .eq("key", "main")
        .single();

    if (error || !data) {
        return { donationGoal: 20000, donationCurrent: 0, donationLink: "", countOffset: 0 };
    }

    const defaults = { donationGoal: 20000, donationCurrent: 0, donationLink: "", countOffset: 0 };
    return { ...defaults, ...data.value };
};

export const updateAdminConfig = async (newConfig: Partial<AdminConfig>) => {
    const current = await getAdminConfig();
    const updated = { ...current, ...newConfig };

    const { error } = await supabase
        .from("admin_config")
        .upsert({ key: "main", value: updated });

    if (error) throw error;
    return true;
};

export const resetSystem = async () => {
    // Delete all submissions except ID 0 (if any special logic existed, but we delete all non-0)
    const { error } = await supabase.from("submissions").delete().neq("id", 0);
    if (error) throw error;

    // Reset offset? Maybe, maybe not. Let's ask user or keep it.
    // For now, let's keep the offset unless explicitly reset.
    // await updateAdminConfig({ countOffset: 0 }); 
    return true;
};
