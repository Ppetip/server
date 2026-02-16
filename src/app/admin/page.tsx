"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ServerFundWidget from "@/components/ServerFundWidget"; // Reusing for consistency, though admin might just want controls

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null);
    const [config, setConfig] = useState<any>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [claimed, setClaimed] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.status === 401) {
                setError("Unauthorized. Access Denied.");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setStats(data);
            // Config is now returned as a separate object or part of stats
            setConfig(data.config || {});
            setClaimed(true);
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch stats.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleClaim = async () => {
        try {
            const res = await fetch("/api/admin/claim", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                fetchStats(); // Refresh
            } else {
                setError(data.error || "Claim failed.");
            }
        } catch (e) {
            setError("Claim failed.");
        }
    };

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config })
            });
            const data = await res.json();
            if (data.success) {
                alert("Config updated!");
                fetchStats();
            }
        } catch (e) {
            alert("Update failed.");
        }
    };

    const handleReset = async () => {
        if (!confirm("DANGER: This will wipe all submissions and reset the counter. Are you sure?")) return;

        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" })
            });
            const data = await res.json();
            if (data.success) {
                alert("System Reset Complete.");
                fetchStats();
            }
        } catch (e) {
            alert("Reset failed.");
        }
    };

    if (loading) return <div className="p-10 text-white">Loading Admin Protocol...</div>;

    if (error === "Unauthorized. Access Denied.") {
        return (
            <div className="min-h-screen bg-[#0f2023] flex items-center justify-center text-white">
                <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-xl text-center max-w-md">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4">lock</span>
                    <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Access Restricted</h1>
                    <p className="text-slate-400 mb-6">This terminal is locked to a specific IP address.</p>
                    <button
                        onClick={handleClaim}
                        className="w-full py-4 bg-[#00d4ff] text-[#0f2023] font-black uppercase tracking-widest rounded-lg hover:bg-[#00d4ff]/90 transition-all"
                    >
                        Initialize Claim Protocol
                    </button>
                    <p className="mt-4 text-xs text-slate-500">
                        (Only works if no admin is currently claimed)
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f2023] text-white font-sans p-8">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#00d4ff]">
                    Admin <span className="text-white">Command</span>
                </h1>
                <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold uppercase tracking-wider">
                    Return to Field
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Card */}
                <div className="bg-[#1a2a2d] border border-white/10 p-6 rounded-xl">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#39FF14] mb-4">Live Metrics</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-slate-400 text-sm">Total Submissions</p>
                            <p className="text-4xl font-black text-white">{stats?.count?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Unique IPs</p>
                            <p className="text-2xl font-bold text-white">{stats?.uniqueIps?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">DB Size (Approx)</p>
                            <p className="text-xl font-mono text-slate-300">{stats?.dbSize} bytes</p>
                        </div>
                    </div>
                </div>

                {/* Config Form */}
                <div className="bg-[#1a2a2d] border border-white/10 p-6 rounded-xl lg:col-span-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#00d4ff] mb-4">Configuration</h2>
                    <form onSubmit={handleUpdateConfig} className="grid gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Donation Goal ($)</label>
                            <input
                                type="number"
                                value={config.donationGoal || 0}
                                onChange={(e) => setConfig({ ...config, donationGoal: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#00d4ff] outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Donation Amount ($)</label>
                            <input
                                type="number"
                                value={config.donationCurrent || 0}
                                onChange={(e) => setConfig({ ...config, donationCurrent: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#00d4ff] outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ko-fi Link</label>
                            <input
                                type="text"
                                value={config.donationLink || ""}
                                onChange={(e) => setConfig({ ...config, donationLink: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#00d4ff] outline-none transition-colors"
                            />
                        </div>
                        <button type="submit" className="bg-[#00d4ff] text-[#0f2023] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#00d4ff]/90 transition-all mt-4">
                            Update Configuration
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        Irreversible actions. Tread carefully.
                    </p>
                    <button
                        onClick={handleReset}
                        className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                        Reset All Data
                    </button>
                </div>
            </div>

            {/* Submission Log */}
            <div className="mt-12">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Recent Transmissions</h2>
                <div className="bg-[#1a2a2d] border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">ID</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Time</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">File</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Hash</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats?.recent?.map((sub: any) => (
                                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-[#00d4ff]">#{sub.id}</td>
                                    <td className="p-4 text-sm text-slate-300">{new Date(sub.createdAt).toLocaleString()}</td>
                                    <td className="p-4 text-sm text-slate-300 truncate max-w-xs">{sub.original_name || sub.file_path}</td>
                                    <td className="p-4 font-mono text-xs text-slate-500 truncate max-w-[100px]">{sub.hash}</td>
                                    <td className="p-4 text-right">
                                        {sub.file_path && (
                                            <a
                                                href={sub.file_path}
                                                download
                                                target="_blank"
                                                className="text-[#39FF14] hover:text-[#39FF14]/80 text-xs font-bold uppercase tracking-wider border border-[#39FF14]/30 px-2 py-1 rounded hover:bg-[#39FF14]/10 transition-colors"
                                            >
                                                Download
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
