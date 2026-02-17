"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ServerFundWidgetProps {
    current: number;
    goal: number;
    link: string;
}

export default function ServerFundWidget({ current = 0, goal = 20000, link = "https://ko-fi.com/sudokuserver" }: ServerFundWidgetProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress on mount
        const timer = setTimeout(() => setProgress(Math.min((current / goal) * 100, 100)), 500);
        return () => clearTimeout(timer);
    }, [current, goal]);

    return (
        <div className="w-full max-w-sm mx-auto bg-[#1a2a2d] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-[#39FF14]/30 transition-colors">

            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl group-hover:bg-[#39FF14]/10 transition-colors"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#39FF14]">savings</span>
                        <span className="text-white font-bold uppercase tracking-wider text-sm">Server Fund</span>
                    </div>
                    <span className="text-[#39FF14] font-mono font-bold">${current.toLocaleString()} / ${goal.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden mb-4 border border-white/5">
                    <div
                        className="h-full bg-[#39FF14] rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    1 Million entries require serious processing power. Help us keep the servers running.
                </p>

                <a
                    href={link}
                    target="_blank"
                    className="block w-full py-2 bg-white/5 hover:bg-[#39FF14] hover:text-[#0f2023] text-white text-center font-bold uppercase tracking-widest text-xs rounded-lg transition-all border border-white/10 hover:border-[#39FF14]"
                >
                    Donate & Support
                </a>
            </div>
        </div>
    );
}
