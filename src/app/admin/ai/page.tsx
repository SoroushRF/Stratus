"use client";

import { useState, useEffect } from "react";
import { 
    Brain, 
    ArrowLeft, 
    Save, 
    History, 
    Settings2, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    ChevronDown,
    Terminal,
    Zap,
    Cpu,
    Activity,
    Code,
    MessageSquare
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "prompts" | "logs" | "config" | "playground";

export default function AILogicControl() {
    const [activeTab, setActiveTab] = useState<Tab>("prompts");
    const [prompts, setPrompts] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
    const [logDetails, setLogDetails] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [promptsRes, logsRes] = await Promise.all([
                fetch('/api/admin/ai/prompts'),
                fetch('/api/admin/ai/logs?limit=50')
            ]);

            if (promptsRes.ok) {
                const pData = await promptsRes.json();
                setPrompts(pData.prompts || []);
                if (pData.prompts?.length > 0) setSelectedPrompt(pData.prompts[0]);
            }
            if (logsRes.ok) {
                const lData = await logsRes.json();
                setLogs(lData.logs || []);
            }
        } catch (err) {
            console.error("Failed to fetch AI data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrompt = async () => {
        if (!selectedPrompt) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/ai/prompts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedPrompt.id,
                    prompt_text: selectedPrompt.prompt_text,
                    model_override: selectedPrompt.model_override,
                    is_active: selectedPrompt.is_active
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setPrompts(prompts.map(p => p.id === updated.prompt.id ? updated.prompt : p));
                alert("Prompt updated successfully!");
            }
        } catch (err) {
            alert("Failed to save prompt");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <button 
                    onClick={() => window.location.href = "/admin"}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Brain className="text-purple-400 w-6 h-6" />
                            <h1 className="text-4xl font-bold tracking-tight">AI Logic Control</h1>
                        </div>
                        <p className="text-white/60">
                            Fine-tune system prompts, monitor extraction latency, and manage Gemini configurations.
                        </p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <TabButton active={activeTab === "prompts"} onClick={() => setActiveTab("prompts")} icon={Code} label="Prompts" />
                        <TabButton active={activeTab === "playground"} onClick={() => setActiveTab("playground")} icon={Zap} label="Playground" />
                        <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")} icon={History} label="Logs" />
                        <TabButton active={activeTab === "config"} onClick={() => setActiveTab("config")} icon={Settings2} label="Config" />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-white/40">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p>Initializing AI Neuralink...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeTab === "prompts" && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Prompt Sidebar */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest px-2">Prompt Slugs</h3>
                                {prompts.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setSelectedPrompt(p)}
                                        className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border ${
                                            selectedPrompt?.id === p.id 
                                            ? "bg-primary/20 border-primary/50 text-white shadow-lg shadow-primary/10" 
                                            : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="font-bold flex items-center justify-between">
                                            {p.slug}
                                            {p.is_active && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                                        </div>
                                        <p className="text-[10px] mt-1 opacity-60">Version {p.version}.0</p>
                                    </button>
                                ))}
                            </div>

                            {/* Editor Area */}
                            <div className="lg:col-span-3 space-y-6">
                                <GlassCard className="border-white/10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <Terminal className="w-4 h-4 text-primary" />
                                            </div>
                                            <h2 className="text-xl font-bold">System Instruction</h2>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group/select">
                                                <select 
                                                    value={selectedPrompt?.model_override || "default"}
                                                    onChange={(e) => setSelectedPrompt({...selectedPrompt, model_override: e.target.value})}
                                                    className="bg-black/60 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer transition-all hover:border-white/20"
                                                    style={{ backgroundColor: '#000000' }}
                                                >
                                                    <option value="default" className="bg-black text-white">Use Global Default</option>
                                                    <option value="gemini-2.5-flash" className="bg-black text-white">Gemini 2.5 Flash</option>
                                                    <option value="gemini-2.5-flash-lite" className="bg-black text-white">2.5 Flash Lite</option>
                                                    <option value="gemini-3-flash" className="bg-black text-white">Gemini 3 Flash</option>
                                                    <option value="gemini-3-pro-preview" className="bg-black text-white">Gemini 3 Pro</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none group-hover/select:text-white transition-colors" />
                                            </div>
                                            <button 
                                                onClick={handleSavePrompt}
                                                disabled={saving}
                                                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Deploy Prompt
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                                        <textarea 
                                            value={selectedPrompt?.prompt_text}
                                            onChange={(e) => setSelectedPrompt({...selectedPrompt, prompt_text: e.target.value})}
                                            spellCheck={false}
                                            className="relative w-full h-[400px] bg-black/40 border border-white/10 rounded-xl p-6 font-mono text-sm leading-relaxed text-emerald-50/90 focus:outline-none focus:border-primary/50 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="mt-4 flex items-center gap-6 text-[10px] text-white/30 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 text-purple-400" />
                                            Live Deployment active
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-3 h-3 text-emerald-400" />
                                            Last Modified: {new Date(selectedPrompt?.updated_at).toLocaleString()}
                                        </div>
                                        <button 
                                            onClick={() => setActiveTab("playground")}
                                            className="ml-auto flex items-center gap-1.5 text-primary hover:text-white transition-colors cursor-pointer"
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                            Open in Playground
                                        </button>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    )}

                    {activeTab === "playground" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <GlassCard className="border-white/10">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Terminal className="w-5 h-5 text-primary" />
                                        Input Simulator
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">Test Prompt</label>
                                            <div className="relative group/playground">
                                                <select 
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer transition-all hover:border-white/20"
                                                    style={{ backgroundColor: '#000000' }}
                                                    onChange={(e) => {
                                                        const p = prompts.find(p => p.slug === e.target.value);
                                                        if (p) setSelectedPrompt(p);
                                                    }}
                                                    value={selectedPrompt?.slug}
                                                >
                                                    {prompts.map(p => <option key={p.id} value={p.slug} className="bg-black text-white">{p.slug}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none group-hover/playground:text-white transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">Sample Data (Raw Text or Image Base64)</label>
                                            <textarea 
                                                placeholder="Paste raw schedule text or base64 image data..."
                                                className="w-full h-[250px] bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/80 focus:outline-none focus:border-primary/50 resize-none"
                                                id="playground-input"
                                            />
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                const input = (document.getElementById('playground-input') as HTMLTextAreaElement).value;
                                                const outputArea = document.getElementById('playground-output') as HTMLPreElement;
                                                if (!input) return alert("Plese provide input data");
                                                
                                                outputArea.innerText = "Running Neural Analysis...";
                                                try {
                                                    const res = await fetch('/api/admin/ai/test', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            prompt: selectedPrompt.prompt_text,
                                                            model: selectedPrompt.model_override,
                                                            sampleInput: input
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    outputArea.innerText = data.output || data.error;
                                                } catch (e) {
                                                    outputArea.innerText = "Network Error during extraction";
                                                }
                                            }}
                                            className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 cursor-pointer"
                                        >
                                            <Brain className="w-5 h-5" />
                                            Execute Neural Test
                                        </button>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="space-y-6">
                                <GlassCard className="border-white/10 h-full flex flex-col">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-emerald-400" />
                                        Extraction Output
                                    </h3>
                                    <pre 
                                        id="playground-output"
                                        className="flex-1 bg-black/60 border border-white/5 rounded-xl p-6 font-mono text-xs text-emerald-400/80 overflow-y-auto whitespace-pre-wrap"
                                    >
                                        // Awaiting execution...
                                    </pre>
                                </GlassCard>
                            </div>
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <GlassCard className="!p-0 overflow-hidden border-white/10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Operation</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Model Used</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Latency</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Timestamp</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Raw</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-xs text-primary">{log.slug}</td>
                                                <td className="px-6 py-4 text-xs text-white/60">{log.model_used || "N/A"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                        log.status === 'success' 
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-white/40">
                                                    {log.latency_ms}ms
                                                </td>
                                                <td className="px-6 py-4 text-xs text-white/40">
                                                    {new Date(log.created_at).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setLogDetails(log)}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    )}

                    {activeTab === "config" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <GlassCard className="border-emerald-500/20 bg-emerald-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <Cpu className="text-emerald-400 w-6 h-6" />
                                    <h2 className="text-xl font-bold">Neural Engine</h2>
                                </div>
                                <div className="space-y-6 font-mono text-sm">
                                    <p className="text-white/40 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                                        AI Config Control is locked in safe mode. Direct parameter manipulation (Temperature, Top-P) is currently managed via database synchronization.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 pt-4 opacity-50">
                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                            <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Defaut Model</span>
                                            <span className="font-bold">Gemini 1.5 Flash</span>
                                        </div>
                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                            <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Safety Filter</span>
                                            <span className="font-bold">Strict</span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="border-purple-500/20 bg-purple-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="text-purple-400 w-6 h-6" />
                                    <h2 className="text-xl font-bold">Latency Optimizer</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                        <span className="text-sm font-medium">Prompt Caching (TTL)</span>
                                        <span className="text-xs font-mono text-purple-400">300s</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                        <span className="text-sm font-medium">Stream Processing</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold uppercase">Optimized</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>
            )}

            {/* Log Details Modal */}
            <AnimatePresence>
                {logDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setLogDetails(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{scale:0.9, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.9, opacity:0, y:20}} className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden">
                            <GlassCard className="border-white/10 flex flex-col h-full !p-0">
                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="text-primary w-5 h-5" />
                                        <h2 className="text-xl font-bold">Execution Trace</h2>
                                    </div>
                                    <button onClick={() => setLogDetails(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
                                        <ArrowLeft className="w-5 h-5 text-white/40" />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed space-y-6">
                                    {logDetails.error_message && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                                            <p className="font-bold mb-1 uppercase tracking-widest text-[10px]">Critical Error</p>
                                            {logDetails.error_message}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <p className="font-bold uppercase tracking-widest text-[10px] text-white/40">Raw Neural Output</p>
                                        <pre className="p-6 bg-black/40 border border-white/10 rounded-xl whitespace-pre-wrap break-all text-emerald-400/80">
                                            {logDetails.raw_output || "NO_OUTPUT_BUFFERED"}
                                        </pre>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
