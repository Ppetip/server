"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google', // Or 'github', configurable
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:inline">
                    {user.email}
                </span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-all"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="px-6 py-2 bg-[#00d4ff] text-[#0f2023] font-black uppercase tracking-widest rounded hover:bg-[#00d4ff]/90 transition-all text-sm"
        >
            Initialize Uplink
        </button>
    );
}
