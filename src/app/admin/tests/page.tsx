'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, 
    Play, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Loader2, 
    Trash2,
    ShieldAlert,
    FlaskConical,
    Activity,
    ChevronDown,
    ChevronUp,
    ListFilter
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';

// Utility to strip ANSI escape codes
const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export default function TestRunnerPage() {
    const [rawOutput, setRawOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    
    // Stats extraction
    const [stats, setStats] = useState({ passed: 0, failed: 0, total: 0 });
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal
    useEffect(() => {
        if (scrollRef.current && isTerminalOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [rawOutput, isTerminalOpen]);

    const cleanedOutput = useMemo(() => stripAnsi(rawOutput), [rawOutput]);

    // Parse output for stats
    useEffect(() => {
        const lines = cleanedOutput.split('\n');
        let p = 0, f = 0, t = 0;

        for (const line of lines) {
            // Vitest format: "Tests  96 passed (96)"
            const vitestMatch = line.match(/Tests\s+(\d+)\s+passed/);
            if (vitestMatch) p = parseInt(vitestMatch[1]);

            const vitestFailMatch = line.match(/Tests\s+(\d+)\s+failed/);
            if (vitestFailMatch) f = parseInt(vitestFailMatch[1]);

            // Playwright format: "3 failed | 10 passed"
            const pwMatch = line.match(/(\d+)\s+passed/);
            if (pwMatch && !line.includes('Tests')) p = parseInt(pwMatch[1]);

            const pwFailMatch = line.match(/(\d+)\s+failed/);
            if (pwFailMatch && !line.includes('Tests')) f = parseInt(pwFailMatch[1]);
        }
        
        setStats({ passed: p, failed: f, total: p + f });
    }, [cleanedOutput]);

    async function runTest(type: 'unit' | 'e2e') {
        setIsRunning(true);
        setStatus('running');
        setRawOutput(`> Initialize ${type.toUpperCase()} Test Suite Runner...\n`);
        setStats({ passed: 0, failed: 0, total: 0 });

        try {
            const response = await fetch('/api/admin/tests/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testType: type }),
            });

            if (!response.ok) throw new Error('Failed to start test runner');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No stream available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                setRawOutput(prev => prev + text);

                if (text.includes('[PROCESS_COMPLETED_WITH_CODE_0]')) {
                    setStatus('passed');
                } else if (text.includes('[PROCESS_COMPLETED_WITH_CODE_')) {
                    if (!text.includes('CODE_0')) setStatus('failed');
                }
            }
        } catch (err: any) {
            setRawOutput(prev => prev + `\n❌ RUNTIME ERROR: ${err.message}`);
            setStatus('failed');
        } finally {
            setIsRunning(false);
        }
    }

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

                <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">System Validation</span>
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight flex items-center gap-4">
                    <FlaskConical className="w-12 h-12 text-primary" />
                    Quality Lab
                </h1>
                <p className="mt-4 text-white/60 max-w-2xl text-lg">
                    Manage and verify system integrity via automated runners. Tests execute in insulated environments.
                </p>
            </header>

            <div className="space-y-8">
                {/* Controls & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <GlassCard className="lg:col-span-1 p-6 space-y-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-6">Select Runner</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => runTest('unit')}
                                    disabled={isRunning}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                        <span className="font-semibold text-sm">Unit Pulse</span>
                                    </div>
                                    <Play className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    onClick={() => runTest('e2e')}
                                    disabled={isRunning}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="w-5 h-5 text-purple-400" />
                                        <span className="font-semibold text-sm">E2E Flow</span>
                                    </div>
                                    <Play className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <AnimatedButton
                                variant="secondary"
                                onClick={() => { setRawOutput(''); setStats({ passed: 0, failed: 0, total: 0 }); setStatus('idle'); }}
                                className="w-full !py-2 text-xs text-white/40 hover:text-white"
                            >
                                <Trash2 className="w-3 h-3 mr-2" /> Reset Lab
                            </AnimatedButton>
                        </div>
                    </GlassCard>

                    {/* Dashboard Summary Card */}
                    <GlassCard className="lg:col-span-3 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10 flex-1 grid grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Execution Status</p>
                                <div className="flex items-center gap-3">
                                    {status === 'idle' && <div className="w-3 h-3 rounded-full bg-white/10" />}
                                    {status === 'running' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                                    {status === 'passed' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                                    {status === 'failed' && <XCircle className="w-6 h-6 text-red-400" />}
                                    <span className={`text-xl font-bold capitalize ${status === 'passed' ? 'text-emerald-400' : status === 'failed' ? 'text-red-400' : 'text-white'}`}>
                                        {status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 border-l border-white/5 pl-8">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Tests Passed</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black ${stats.passed > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                                        {stats.passed}
                                    </span>
                                    <span className="text-white/20 text-sm">/ {stats.total}</span>
                                </div>
                            </div>

                            <div className="space-y-2 border-l border-white/5 pl-8">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Failures</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black ${stats.failed > 0 ? 'text-red-400' : 'text-white/20'}`}>
                                        {stats.failed}
                                    </span>
                                    <span className="text-white/20 text-sm">Detected</span>
                                </div>
                            </div>
                        </div>

                        <div className="ml-8 relative z-10">
                            <button 
                                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                    {isTerminalOpen ? <ChevronUp className="w-6 h-6" /> : <ListFilter className="w-5 h-5" />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    {isTerminalOpen ? 'Hide Logs' : 'View Logs'}
                                </span>
                            </button>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </GlassCard>
                </div>

                {/* Collapsible Terminal */}
                <AnimatePresence>
                    {isTerminalOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <GlassCard className="h-[500px] flex flex-col !p-0 bg-black/95 border-white/10 overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs font-mono font-bold text-white/40 tracking-widest uppercase">Stratus Live Output</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-white/20">
                                        UTF-8 | NO-COLOR | STREAM ACTIVE
                                    </div>
                                </div>
                                <div 
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-8 font-mono text-[13px] leading-relaxed text-blue-100/60 custom-scrollbar"
                                >
                                    {cleanedOutput.split('\n').map((line, i) => {
                                        if (!line.trim() && i === cleanedOutput.split('\n').length - 1) return null;
                                        
                                        let color = "text-white/60";
                                        if (line.includes('✓') || line.includes('PASS') || line.includes('passed')) color = "text-emerald-400 font-bold";
                                        if (line.includes('✕') || line.includes('FAIL') || line.includes('failed') || line.includes('Error:')) color = "text-red-400 font-bold";
                                        if (line.startsWith('>')) color = "text-primary font-bold opacity-100";
                                        
                                        return (
                                            <div key={i} className={`${color} mb-1 flex`}>
                                                <span className="opacity-10 mr-4 w-8 shrink-0 select-none text-right">{(i + 1)}</span>
                                                <span className="break-all">{line}</span>
                                            </div>
                                        );
                                    })}
                                    {isRunning && (
                                        <div className="flex items-center gap-2 mt-4 text-primary text-xs italic">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Streaming logs from server...
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
