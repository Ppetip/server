import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-8 bg-[#0f2023] text-white font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#00d4ff]">
            Secure <span className="text-white">Uplink</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
            Encrypted Transmission Protocol v2.0
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </header>
      <Hero />
    </main>
  );
}
