"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";

export default function SubmitPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // PDF Upload State
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile?.type === "application/pdf") {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setError("");
        } else {
            setError("Only PDF files are allowed.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
    });

    const handleSubmitPdf = async () => {
        if (!file) {
            setError("Please select a PDF file first.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("Authentication session expired. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();

            // Mark as submitted locally
            localStorage.setItem("sudoku_submitted", "true");

            router.push(`/receipt/${data.id}?file=${encodeURIComponent(data.file_path)}&hash=${data.hash || "secure"}`);
        } catch (err: any) {
            setError(err.message || "Upload failed.");
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0f2023] flex items-center justify-center text-white">Initializing Secure Connection...</div>;

    return (
        <div className="min-h-screen bg-[#0f2023] text-white font-sans selection:bg-[#00d4ff] selection:text-[#0f2023]">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0f2023]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-[#00d4ff] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-bold text-sm tracking-wider uppercase text-slate-400 group-hover:text-white transition-colors">Abort Mission</span>
                    </Link>
                    <div className="font-black italic tracking-tighter text-xl">
                        SUDOKU <span className="text-[#00d4ff]">HUNT</span>
                    </div>
                    <div className="w-24"></div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">

                {/* Left Column: Input Area */}
                <div className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
                            Submit Evidence
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload your completed Sudoku puzzle (PDF only).
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 animate-pulse">
                            <span className="material-symbols-outlined">warning</span>
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <div className="bg-[#1a2a2d] p-8 rounded-xl border border-white/10 shadow-2xl shadow-[#00d4ff]/5 flex flex-col items-center justify-center min-h-[600px]">
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`w-full h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive
                                    ? "border-[#39FF14] bg-[#39FF14]/10"
                                    : "border-white/20 hover:border-[#00d4ff] hover:bg-white/5"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <span className="material-symbols-outlined text-6xl mb-6 text-[#00d4ff]">upload_file</span>
                                <p className="text-2xl font-bold text-white mb-2">Drag & Drop PDF</p>
                                <p className="text-sm text-slate-500 font-mono bg-black/30 px-3 py-1 rounded">.PDF files only</p>
                            </div>
                        ) : (
                            <div className="w-full flex-1 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4 bg-white/5 p-4 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#00d4ff]/20 p-2 rounded">
                                            <span className="material-symbols-outlined text-[#00d4ff]">picture_as_pdf</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-xs text-slate-400">Ready for transmission</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded transition-colors text-sm font-bold uppercase tracking-wider"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {previewUrl && (
                                    <div className="flex-1 w-full border border-white/10 rounded-lg overflow-hidden bg-black/50 relative group min-h-[500px]">
                                        <iframe src={previewUrl} className="w-full h-full min-h-[500px]" title="PDF Preview" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-[#1a2a2d] border border-white/10 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d4ff]/5 rounded-full blur-2xl"></div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Submission Status</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-bold">Ready?</span>
                            <span className="text-[#00d4ff] font-mono">{file ? "YES" : "WAITING"}</span>
                        </div>

                        <button
                            onClick={handleSubmitPdf}
                            disabled={isSubmitting || !file}
                            className="w-full py-4 bg-[#39FF14] hover:bg-[#39FF14]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2023] font-black uppercase tracking-wider rounded-lg transition-all glow-green flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <span className="animate-spin material-symbols-outlined">sync</span>
                            ) : (
                                <>
                                    TRANSMIT FILE
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-[#1a2a2d] border border-white/10 p-6 rounded-xl">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Verification Protocol</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[#00d4ff] text-sm mt-0.5">check_circle</span>
                                <span>Ensure PDF is legible.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[#00d4ff] text-sm mt-0.5">check_circle</span>
                                <span>One puzzle per file.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[#00d4ff] text-sm mt-0.5">check_circle</span>
                                <span>Max file size: 5MB</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </main>
        </div>
    );
}
