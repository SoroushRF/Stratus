"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, Calendar, Clock, MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
                                <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                                    <CheckCircle2 className="text-emerald-400 w-8 h-8" />
                                    Parsing Results
                                </h2>
                                <p className="text-zinc-400 mt-1 font-medium">Grouped by course title.</p>
                            </div>
                            <button 
                                onClick={() => setStatus("idle")}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-colors border border-white/10"
                            >
                                Parse Another
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {(() => {
                                // Grouping logic
                                const grouped = classes.reduce((acc, cls) => {
                                    if (!acc[cls.name]) acc[cls.name] = [];
                                    acc[cls.name].push(cls);
                                    return acc;
                                }, {} as Record<string, ParsedClass[]>);

                                const courseNames = Object.keys(grouped);

                                if (courseNames.length === 0) {
                                    return (
                                        <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10 italic text-zinc-500">
                                            No classes detected in the provided document.
                                        </div>
                                    );
                                }

                                return courseNames.map((name, i) => (
                                    <CourseDropdown key={i} title={name} instances={grouped[name]} />
                                ));
                            })()}
                        </div>
                    </div>
                )}

                <footer className="mt-20 pt-12 border-t border-white/5 text-center flex items-center justify-center gap-4 opacity-50 grayscale pointer-events-none">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Lean Output Phase</span>
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Gemini 2.5 Flash Lite</span>
                </footer>
            </div>
        </main>
    );
}



function CourseDropdown({ title, instances }: { title: string; instances: ParsedClass[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`
            group rounded-[32px] border transition-all duration-500 overflow-hidden
            ${isOpen ? "bg-white/10 border-primary/30 shadow-[0_0_40px_rgba(139,92,246,0.1)]" : "bg-white/5 border-white/10 hover:border-white/20"}
        `}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-7 flex items-center justify-between text-left relative z-10"
            >
                <div className="space-y-1">
                    <h4 className="text-2xl font-black tracking-tight italic group-hover:text-primary transition-colors">
                        {title}
                    </h4>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-primary animate-pulse" : "bg-zinc-600"}`} />
                        {instances.length} {instances.length === 1 ? 'Session' : 'Sessions'}
                    </p>
                </div>
                <div className={`
                    w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-500
                    ${isOpen ? "bg-primary/20 text-primary" : "text-zinc-500"}
                `}>
                    <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="px-8 pb-8 space-y-3">
                            {instances.map((instance, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.1 }}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex flex-wrap gap-4 text-zinc-300 text-sm font-medium">
                                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {instance.startTime} - {instance.endTime}
                                        </span>
                                        {instance.location && (
                                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 uppercase tracking-wider text-[10px]">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {instance.location}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {instance.days && instance.days.length > 0 && (
                                        <div className="flex gap-1.5">
                                            {instance.days.map((day) => (
                                                <span key={day} className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-tighter">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


