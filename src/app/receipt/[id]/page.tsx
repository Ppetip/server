"use client";

import { useEffect, useState, use } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import ServerFundWidget from "@/components/ServerFundWidget";

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [globalCount, setGlobalCount] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fire confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00d4ff', '#39FF14', '#ffffff']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00d4ff', '#39FF14', '#ffffff']
            });

            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        // Live Counter
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats");
                const data = await res.json();
                if (data.count) setGlobalCount(data.count);
            } catch (e) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Live update
        return () => clearInterval(interval);

    }, []);

    const handleShare = () => {
        navigator.clipboard.writeText("https://sudokuhunt.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0f2023] text-white font-sans selection:bg-[#00d4ff] selection:text-[#0f2023]">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0f2023]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-[#00d4ff] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-bold text-sm tracking-wider uppercase text-slate-400 group-hover:text-white transition-colors">Return to Base</span>
                    </Link>
                    <div className="font-black italic tracking-tighter text-xl">
                        SUDOKU <span className="text-[#00d4ff]">HUNT</span>
                    </div>
                    <div className="w-24"></div>
                </div>
            </nav>

            <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left Column: Receipt Card */}
                <div className="bg-[#1a2a2d] border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-[#39FF14]/10 text-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00d4ff] via-[#39FF14] to-[#00d4ff]"></div>

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#39FF14]/10 mb-6 animate-bounce border border-[#39FF14]/20">
                        <span className="material-symbols-outlined text-[#39FF14] text-5xl">check_circle</span>
                    </div>

                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">
                        Contribution Received!
                    </h1>
                    <div className="inline-block bg-[#00d4ff]/10 border border-[#00d4ff]/30 px-6 py-2 rounded-full mb-6">
                        <span className="text-[#00d4ff] font-black uppercase tracking-widest text-lg">You are #{id}</span>
                    </div>

                    <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Your puzzle has been vaulted. We are <span className="text-white font-bold">one step closer</span> to the 1,000,000 goal.
                    </p>

                    {/* Social Share Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={handleShare} className="col-span-2 py-3 bg-[#0f2023] hover:bg-black/50 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all">
                            <span className="material-symbols-outlined text-[#00d4ff]">{copied ? 'check' : 'link'}</span>
                            <span className="font-bold uppercase tracking-wider text-sm">{copied ? 'Link Copied' : 'Copy Link'}</span>
                        </button>

                        <a href={`https://twitter.com/intent/tweet?text=I%20just%20secured%20Submission%20%23${id}%20in%20the%20Million%20Sudoku%20Hunt!%20Join%20the%20effort.&url=https%3A%2F%2Fsudokuhunt.com`} target="_blank" className="py-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-lg flex items-center justify-center gap-2 text-[#1DA1F2] font-bold uppercase tracking-wider text-sm transition-all">
                            <span>Twitter / X</span>
                        </a>

                        <a href={`sms:&body=I%20just%20contributed%20Sudoku%20%23${id}%20to%20the%20Hunt!%20Help%20us%20reach%201M%3A%20https%3A%2F%2Fsudokuhunt.com`} className="py-3 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 rounded-lg flex items-center justify-center gap-2 text-[#39FF14] font-bold uppercase tracking-wider text-sm transition-all">
                            <span>SMS</span>
                        </a>
                    </div>

                    <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                        <p className="text-sm font-bold uppercase tracking-widest text-[#00d4ff] mb-2">Vault Progress</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-white font-black text-2xl">{globalCount.toLocaleString()}</span>
                            <span className="text-slate-500 text-sm">Target: 1,000,000</span>
                        </div>
                        {/* Animated Progress Bar */}
                        <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden relative">
                            {/* Moving Striped Pattern */}
                            <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}>
                            </div>
                            <div
                                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#39FF14] rounded-full shadow-[0_0_15px_#39FF14] transition-all duration-1000 ease-out relative"
                                style={{ width: `${Math.max((globalCount / 1000000) * 100, 1)}%` }} // Ensure at least a sliver is visible
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)' }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: CTA & Widget */}
                <div className="space-y-8">
                    <div className="bg-[#1a2a2d] border border-white/10 rounded-2xl p-8 hover:border-[#00d4ff]/30 transition-colors group">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                            Expand the Hunt
                        </h2>
                        <p className="text-slate-400 mb-6 text-lg">
                            I was number <span className="text-[#00d4ff] font-bold">#{id}</span> you could be next.
                        </p>
                        <p className="text-slate-400 mb-6">
                            Copy this transmission and recruit others to the cause.
                        </p>

                        <div className="space-y-3">
                            <textarea
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-slate-300 focus:outline-none focus:border-[#00d4ff] transition-colors resize-none font-mono"
                                rows={4}
                                defaultValue={`I just secured Submission #${id} in the Million Sudoku Hunt! Join the effort. https://sudokuhunt.com`}
                                id="recruit-text"
                            ></textarea>
                            <button
                                onClick={() => {
                                    const text = (document.getElementById('recruit-text') as HTMLTextAreaElement).value;
                                    navigator.clipboard.writeText(text);
                                    const btn = document.getElementById('recruit-btn');
                                    if (btn) {
                                        const original = btn.innerHTML;
                                        btn.innerHTML = '<span class="material-symbols-outlined">check</span> COPIED!';
                                        btn.classList.add('bg-[#39FF14]', 'text-[#0f2023]');
                                        btn.classList.remove('bg-[#00d4ff]', 'text-[#0f2023]');
                                        setTimeout(() => {
                                            btn.innerHTML = original;
                                            btn.classList.remove('bg-[#39FF14]', 'text-[#0f2023]');
                                            btn.classList.add('bg-[#00d4ff]', 'text-[#0f2023]');
                                        }, 2000);
                                    }
                                }}
                                id="recruit-btn"
                                className="w-full py-3 bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-[#0f2023] font-black uppercase tracking-widest rounded-lg transition-all glow-primary flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                                Copy Transmission
                            </button>
                        </div>
                    </div>

                    {/* Donation Widget */}
                    <ServerFundWidget />
                </div>

            </div>
        </div>
    );
}
