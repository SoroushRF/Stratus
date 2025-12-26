"use client";

import { useState, useEffect } from "react";
import { 
    Activity, 
    ArrowLeft, 
    Save, 
    AlertTriangle,
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Power,
    Bell,
    TrendingUp,
    Cloud,
    Zap,
    BarChart3
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

interface SystemNotice {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "critical" | "maintenance";
    is_active: boolean;
    expires_at: string | null;
}

export default function OperationsControl() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [weatherUsage, setWeatherUsage] = useState(0);
    const [weatherLimit, setWeatherLimit] = useState(500);
    const [notices, setNotices] = useState<SystemNotice[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // New notice form
    const [newNotice, setNewNotice] = useState({
        title: "",
        message: "",
        type: "info" as "info" | "warning" | "critical" | "maintenance",
        expires_at: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configRes, noticesRes, analyticsRes] = await Promise.all([
                fetch('/api/admin/operations?type=config'),
                fetch('/api/admin/operations?type=notices'),
                fetch('/api/admin/operations?type=analytics')
            ]);

            if (configRes.ok) {
                const { config } = await configRes.json();
                setMaintenanceMode(config.maintenance_mode === 'true' || config.maintenance_mode === true);
                setWeatherUsage(parseInt(config.tomorrow_api_usage_daily || '0'));
                setWeatherLimit(parseInt(config.tomorrow_api_limit || '500'));
            }

            if (noticesRes.ok) {
                const { notices: noticesList } = await noticesRes.json();
                setNotices(noticesList || []);
            }

            if (analyticsRes.ok) {
                const { analytics: analyticsData } = await analyticsRes.json();
                setAnalytics(analyticsData);
            }
        } catch (error) {
            console.error('Error fetching operations data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMaintenanceMode = async () => {
        try {
            setSaving(true);
            const newValue = !maintenanceMode;
            
            const res = await fetch('/api/admin/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'maintenance', enabled: newValue })
            });

            if (res.ok) {
                setMaintenanceMode(newValue);
                setSaveStatus("success");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } finally {
            setSaving(false);
        }
    };

    const createNotice = async () => {
        if (!newNotice.title || !newNotice.message) {
            alert('Please fill in title and message');
            return;
        }

        try {
            setSaving(true);
            const res = await fetch('/api/admin/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'create_notice',
                    ...newNotice 
                })
            });

            if (res.ok) {
                setNewNotice({ title: "", message: "", type: "info", expires_at: "" });
                await fetchData();
                setSaveStatus("success");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 2000);
            }
        } catch (error) {
            console.error('Error creating notice:', error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } finally {
            setSaving(false);
        }
    };

    const toggleNotice = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/admin/operations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'toggle_notice',
                    id,
                    is_active: !currentStatus 
                })
            });

            if (res.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error('Error toggling notice:', error);
        }
    };

    const weatherUsagePercent = (weatherUsage / weatherLimit) * 100;

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
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">Phase 4</span>
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight flex items-center gap-4">
                    <Activity className="w-12 h-12 text-primary" />
                    Operations & Health
                </h1>
                <p className="mt-4 text-white/60 max-w-2xl text-lg">
                    System monitoring, maintenance controls, and real-time analytics for API usage and costs.
                </p>

                {saveStatus === "success" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-400 mt-4"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Saved successfully</span>
                    </motion.div>
                )}
            </header>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Maintenance Mode */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Power className={`w-6 h-6 ${maintenanceMode ? 'text-red-400' : 'text-green-400'}`} />
                                <h3 className="font-bold">System Status</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className={`px-4 py-3 rounded-lg ${maintenanceMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
                                <p className="text-sm font-mono">
                                    {maintenanceMode ? '🔴 MAINTENANCE MODE' : '🟢 OPERATIONAL'}
                                </p>
                            </div>
                            <button
                                onClick={toggleMaintenanceMode}
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                                    maintenanceMode 
                                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    maintenanceMode ? 'Resume Operations' : 'Enable Maintenance'
                                )}
                            </button>
                            <p className="text-xs text-white/50">
                                {maintenanceMode 
                                    ? 'AI and Weather services are paused' 
                                    : 'All systems running normally'}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Weather API Usage */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Cloud className="w-6 h-6 text-blue-400" />
                            <h3 className="font-bold">Weather API</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white/60">Daily Usage</span>
                                    <span className="font-mono">{weatherUsage} / {weatherLimit}</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all ${
                                            weatherUsagePercent > 90 ? 'bg-red-500' : 
                                            weatherUsagePercent > 70 ? 'bg-yellow-500' : 
                                            'bg-green-500'
                                        }`}
                                        style={{ width: `${Math.min(weatherUsagePercent, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <TrendingUp className="w-4 h-4 text-white/40" />
                                <span className="text-white/60">
                                    {weatherLimit - weatherUsage} requests remaining
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Active Notices */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-6 h-6 text-yellow-400" />
                            <h3 className="font-bold">Active Notices</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="text-4xl font-bold text-primary">
                                {notices.filter(n => n.is_active).length}
                            </div>
                            <p className="text-sm text-white/60">
                                {notices.filter(n => n.is_active).length === 0 
                                    ? 'No active broadcasts' 
                                    : 'Broadcasting to users'}
                            </p>
                        </div>
                    </GlassCard>
                </div>

                {/* Token Analytics */}
                {analytics && (
                    <GlassCard className="p-6 mb-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-primary" />
                            Gemini Token Analytics
                        </h2>

                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/40 mb-2">Total Tokens</p>
                                <p className="text-2xl font-bold text-primary">
                                    {analytics.totalTokens.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/40 mb-2">Input Tokens</p>
                                <p className="text-2xl font-bold">
                                    {analytics.totalPromptTokens.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-white/40 mb-2">Output Tokens</p>
                                <p className="text-2xl font-bold">
                                    {analytics.totalCompletionTokens.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-green-500/20">
                                <p className="text-xs text-white/40 mb-2">Estimated Cost</p>
                                <p className="text-2xl font-bold text-green-400">
                                    ${analytics.estimatedCost.toFixed(4)}
                                </p>
                            </div>
                        </div>

                        {/* Usage by Model */}
                        <div>
                            <h3 className="font-semibold mb-4 text-sm text-white/60">Usage by Model</h3>
                            <div className="space-y-3">
                                {Object.entries(analytics.byModel || {}).map(([model, stats]: [string, any]) => (
                                    <div key={model} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-sm font-semibold">{model}</span>
                                            <span className="text-xs text-white/40">{stats.count} requests</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-white/40">Input</p>
                                                <p className="font-mono">{stats.prompt.toLocaleString()} tokens</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40">Output</p>
                                                <p className="font-mono">{stats.completion.toLocaleString()} tokens</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* System Notices Management */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Bell className="w-6 h-6 text-primary" />
                        System Notices
                    </h2>

                    {/* Create New Notice */}
                    <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                        <h3 className="font-semibold mb-4">Create New Notice</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Notice title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Type</label>
                                <select
                                    value={newNotice.type}
                                    onChange={(e) => setNewNotice({...newNotice, type: e.target.value as any})}
                                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="critical">Critical</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-white/60 mb-2">Message</label>
                            <textarea
                                value={newNotice.message}
                                onChange={(e) => setNewNotice({...newNotice, message: e.target.value})}
                                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                placeholder="Notice message..."
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-white/60 mb-2">Expires At (Optional)</label>
                            <input
                                type="datetime-local"
                                value={newNotice.expires_at}
                                onChange={(e) => setNewNotice({...newNotice, expires_at: e.target.value})}
                                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            onClick={createNotice}
                            disabled={saving}
                            className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create Notice
                        </button>
                    </div>

                    {/* Existing Notices */}
                    <div className="space-y-3">
                        {notices.length === 0 ? (
                            <p className="text-white/40 text-center py-8">No notices created yet</p>
                        ) : (
                            notices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className={`p-4 rounded-lg border ${
                                        notice.is_active 
                                            ? 'bg-white/5 border-white/10' 
                                            : 'bg-white/5 border-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    notice.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                    notice.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    notice.type === 'maintenance' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {notice.type.toUpperCase()}
                                                </span>
                                                {notice.is_active && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold mb-1">{notice.title}</h4>
                                            <p className="text-sm text-white/60 mb-2">{notice.message}</p>
                                            {notice.expires_at && (
                                                <p className="text-xs text-white/40">
                                                    Expires: {new Date(notice.expires_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleNotice(notice.id, notice.is_active)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                notice.is_active
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                            }`}
                                        >
                                            {notice.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
        </div>
    );
}
