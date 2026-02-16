"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ServerFundWidget from "@/components/ServerFundWidget";

export default function Hero() {
  const [count, setCount] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check local submission status
    if (typeof window !== "undefined" && localStorage.getItem("sudoku_submitted")) {
      setHasSubmitted(true);
    }

    // Admin Keypress Listener
    let keyPresses: number[] = [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "0") {
        const now = Date.now();
        keyPresses.push(now);
        // Keep only presses within last 2 seconds
        keyPresses = keyPresses.filter(t => now - t < 2000);
        if (keyPresses.length >= 7) {
          setShowAdmin(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.count !== undefined) setCount(data.count);
      } catch (e) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f2023]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00d4ff]/10 rounded-lg">
                <span className="material-symbols-outlined text-[#00d4ff] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">Sudoku <span className="text-[#00d4ff]">Hunt</span></span>
            </div>

            <div className="flex items-center gap-4">
              {showAdmin && (
                <Link href="/admin" className="text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-xs border border-red-500/20 px-3 py-1 rounded hover:bg-red-500/10 transition-colors animate-pulse">
                  Admin Access
                </Link>
              )}
              {!hasSubmitted && (
                <Link href="/submit" className="bg-[#00d4ff] hover:brightness-110 text-[#0f2023] px-6 py-2 rounded-lg font-bold text-sm transition-all uppercase tracking-wider hidden sm:block">
                  Submit
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-20 pb-32 overflow-hidden grid-bg">
        {/* Decorative Light Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-[#00d4ff]/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-[#39FF14]/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#39FF14]"></span>
            </span>
            <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Live Submission Counter</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
            HELP US REACH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-white">1,000,000</span> TO FIND THE HINT
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            We need to gather 1 million unique puzzles to reveal the hidden information. <span className="text-white font-bold">Your contribution is a vital piece of the puzzle.</span>
          </p>

          <div className="bg-[#1a2a2d]/50 border border-white/10 p-8 md:p-12 rounded-2xl mb-12 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
              <div className="text-left">
                <p className="text-sm font-bold text-[#00d4ff] tracking-[0.3em] uppercase mb-2">Mission Progress</p>
                <h3 className="text-4xl md:text-5xl font-black text-white">{count.toLocaleString()} <span className="text-slate-500 text-2xl">/ 1,000,000</span></h3>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-[#00d4ff]">{((count / 1000000) * 100).toFixed(4)}%</span>
              </div>
            </div>

            <div className="w-full bg-white/5 h-8 rounded-full overflow-hidden p-1.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#00d4ff]/60 to-[#00d4ff] rounded-full glow-primary transition-all duration-1000"
                style={{ width: `${(count / 1000000) * 100}%` }}
              ></div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-8 border-white/5 pt-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-500">person</span>
                <span className="text-slate-400 text-sm font-medium">One submission per person</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {!hasSubmitted ? (
              <>
                <Link href="/submit" className="group relative px-12 py-6 bg-[#39FF14] hover:bg-[#39FF14]/90 text-[#0f2023] font-black text-2xl rounded-xl transition-all glow-green uppercase italic tracking-tighter flex items-center">
                  SUBMIT YOUR SUDOKU
                  <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                  Submit once to secure your rank: <span className="text-white">#{count + 1}</span>
                </p>
              </>
            ) : (
              <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 px-8 py-6 rounded-2xl flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
                <div className="bg-[#00d4ff]/20 p-3 rounded-full mb-2">
                  <span className="material-symbols-outlined text-[#00d4ff] text-3xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Contribution Logged</h3>
                <p className="text-slate-400 text-sm">Return frequently to track global progress.</p>
              </div>
            )}
          </div>

          <div className="mt-16">
            <ServerFundWidget />
          </div>
        </div>
      </section>
    </>
  );
}
