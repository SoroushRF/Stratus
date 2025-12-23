"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, Calendar, Clock, MapPin } from "lucide-react";
import { processSchedule } from "@/app/actions";
import { ParsedClass } from "@/types";

export default function Home() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus("loading");
        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const response = await processSchedule(base64Data, file.type);

                if (response.success && response.data) {
                    setClasses(response.data);
                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(response.error || "Failed to parse schedule.");
                }
            };
        } catch (err) {
            setStatus("error");
            setError("Error reading file.");
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                {/* Header */}
                <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                        SCHEDULE <span className="text-primary italic">PARSER</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
                        The leanest engine to extract your temporal blueprint.
                    </p>
                </div>

                {/* Upload Section */}
                {status !== "success" && (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        <label className={`
                            relative flex flex-col items-center justify-center w-full min-h-[300px] 
                            rounded-[40px] border-2 border-dashed transition-all cursor-pointer
                            ${status === "loading" ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30"}
                        `}>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" disabled={status === "loading"} />
                            
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-6">
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                                        <h3 className="text-2xl font-bold mb-2">Gemini is Thinking...</h3>
                                        <p className="text-zinc-400">Deconstructing your schedule image.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Drop your schedule here</h3>
                                        <p className="text-zinc-400">Image or PDF. We'll handle the rest.</p>
                                    </>
                                )}
                            </div>
                        </label>
                        
                        {status === "error" && (
                            <div className="mt-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <p className="font-medium text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Section */}
                {status === "success" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                                    Engine Output
                                </h2>
                                <p className="text-zinc-400 mt-1">Detected {classes.length} distinct classes.</p>
                            </div>
                            <button 
                                onClick={() => setStatus("idle")}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-colors border border-white/10"
                            >
                                Parse Another
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {classes.length > 0 ? (
                                classes.map((cls, i) => (
                                    <div key={i} className="group p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-primary/30 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors italic">
                                                    {cls.name}
                                                </h4>
                                                <div className="flex flex-wrap gap-4 text-zinc-400 text-sm font-medium">
                                                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {cls.startTime} - {cls.endTime}
                                                    </span>
                                                    {cls.location && (
                                                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider text-[10px]">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {cls.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {cls.days && cls.days.length > 0 && (
                                                <div className="flex gap-1.5">
                                                    {cls.days.map((day) => (
                                                        <span key={day} className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black border border-primary/20">
                                                            {day.substring(0, 3)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10 italic text-zinc-500">
                                    No classes detected in the provided document.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <footer className="mt-20 pt-12 border-t border-white/5 text-center flex items-center justify-center gap-4 opacity-50 grayscale pointer-events-none">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Lean Output Phase</span>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Gemini AI</span>
                </footer>
            </div>
        </main>
    );
}
