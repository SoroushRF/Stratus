"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users as UsersIcon, ArrowLeft, Clock, User as UserIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";

export default function UsersManagement() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('/api/admin/data');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Failed to fetch user data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
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
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">Phase 1</span>
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight flex items-center gap-4">
                    <UsersIcon className="w-12 h-12 text-primary" />
                    User Management
                </h1>
                <p className="mt-4 text-white/60 max-w-2xl text-lg">
                    View and manage all registered users, their university affiliations, and account status.
                </p>
            </header>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6">
                    <p className="text-sm text-white/40 mb-2">Total Users</p>
                    <p className="text-4xl font-bold text-primary">{data?.stats?.totalUsers || 0}</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <p className="text-sm text-white/40 mb-2">Active Today</p>
                    <p className="text-4xl font-bold text-emerald-400">{data?.users?.length || 0}</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <p className="text-sm text-white/40 mb-2">Total Analyses</p>
                    <p className="text-4xl font-bold">{data?.stats?.totalAnalyses || 0}</p>
                </GlassCard>
            </div>

            {/* User Directory */}
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
                                                <Image 
                                                    src={user.picture} 
                                                    alt={user.name || "User"} 
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full border border-white/10" 
                                                />
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
    );
}
