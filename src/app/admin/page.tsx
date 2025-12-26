"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Database, 
    Brain, 
    Activity, 
    ChevronRight, 
    TrendingUp, 
    ShieldCheck, 
    AlertTriangle,
    Clock,
    User as UserIcon,
    Loader2
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const adminModules = [
    {
        title: "User Management",
        description: "View and manage registered students and their university affiliations.",
        icon: Users,
        color: "text-blue-400",
        stats: "Live Feed",
        phase: 1
    },
    {
        title: "AI Logic Control",
        description: "Fine-tune Gemini prompts and extraction parameters.",
        icon: Brain,
        color: "text-purple-400",
        stats: "AI Brain",
        phase: 3
    },
    {
        title: "University Database",
        description: "Manage campus mappings, coordinates, and geofencing data.",
        icon: Database,
        color: "text-emerald-400",
        stats: "Static Config",
        phase: 2
    },
    {
        title: "Operations & Health",
        description: "Monitor API quotas, manage maintenance mode, and broadcast system notices.",
        icon: Activity,
        color: "text-amber-400",
        stats: "Control Room",
        phase: 4
    }
];

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdminData() {
            try {
                const res = await fetch('/api/admin/data');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to fetch admin data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">Admin Command Center</span>
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Stratus <span className="text-white/40">Operations</span>
                </h1>
                <p className="mt-4 text-white/60 max-w-2xl text-lg">
                    Phase 1 is live. You are now viewing real-time user metrics and system activity directly from the production database.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard 
                    label="Total Registered Users" 
                    value={data?.stats?.totalUsers?.toLocaleString() || "0"} 
                    trend="Real-time" 
                    icon={Users}
                    color="text-primary"
                />
                <StatCard 
                    label="Total Analyses Run" 
                    value={data?.stats?.totalAnalyses?.toLocaleString() || "0"} 
                    trend="Historical" 
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <StatCard 
                    label="AI Accuracy" 
                    value="98.2%" 
                    trend="Stable" 
                    icon={ShieldCheck}
                    color="text-blue-400"
                />
            </div>

            {/* User Directory - Phase 1 Core */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold">Recent User Directory</h2>
                    </div>
                    <button className="text-sm text-primary font-medium hover:underline cursor-pointer">View All Users</button>
                </div>
                
                <GlassCard className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">User</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">University / Campus</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data?.users?.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.picture ? (
                                                    <img src={user.picture} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-white/40" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{user.name || "Anonymous User"}</p>
                                                    <p className="text-xs text-white/40">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.user_profiles?.[0] ? (
                                                <>
                                                    <p className="text-sm font-medium">{user.user_profiles[0].university}</p>
                                                    <p className="text-xs text-white/40">{user.user_profiles[0].campus}</p>
                                                </>
                                            ) : (
                                                <p className="text-xs text-white/20 italic">No profile yet</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-white/60">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {adminModules.map((module, index) => (
                    <motion.div
                        key={module.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                            if (module.title === "User Management") {
                                window.location.href = "/admin/users";
                            } else if (module.title === "University Database") {
                                window.location.href = "/admin/universities";
                            } else if (module.title === "AI Logic Control") {
                                window.location.href = "/admin/ai";
                            } else if (module.title === "Operations & Health") {
                                window.location.href = "/admin/operations";
                            }
                        }}
                    >
                        <GlassCard className="h-full group hover:border-white/30 transition-all cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <module.icon className={`w-8 h-8 ${module.color}`} />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Phase {module.phase}</span>
                                    <p className="text-sm font-medium mt-1">{module.stats}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{module.title}</h2>
                                <p className="text-white/50">{module.description}</p>
                            </div>

                            <div className="mt-8 flex items-center text-primary text-sm font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                Launch Module <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: any) {
    return (
        <GlassCard className="!p-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/40 font-medium">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{value}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white/5 ${color}/20`}>
                    {trend}
                </span>
            </div>
        </GlassCard>
    );
}
