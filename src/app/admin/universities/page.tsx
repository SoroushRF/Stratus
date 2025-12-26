"use client";

import { useState, useEffect } from "react";
import { 
    Database, 
    Plus, 
    Search, 
    MapPin, 
    Trash2, 
    Edit2, 
    ArrowLeft,
    RefreshCw,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Globe,
    X,
    Save
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export default function UniversityManagement() {
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [migrationStatus, setMigrationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [expandedUnis, setExpandedUnis] = useState<Set<string>>(new Set());
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        short_name: "",
        campus: "",
        lat: 0,
        lng: 0
    });

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/universities');
            if (res.ok) {
                const result = await res.json();
                setUniversities(result.universities || []);
            }
        } catch (err) {
            console.error("Failed to fetch universities:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!confirm("This will migrate all universities from the static JSON file to the database. Continue?")) return;
        
        try {
            setMigrationStatus("loading");
            const res = await fetch('/api/admin/migrate', { method: 'POST' });
            if (res.ok) {
                setMigrationStatus("success");
                fetchUniversities();
                setTimeout(() => setMigrationStatus("idle"), 3000);
            } else {
                setMigrationStatus("error");
            }
        } catch (err) {
            setMigrationStatus("error");
        }
    };

    const toggleExpand = (uniName: string) => {
        const next = new Set(expandedUnis);
        if (next.has(uniName)) next.delete(uniName);
        else next.add(uniName);
        setExpandedUnis(next);
    };

    const handleOpenModal = (campus: any = null) => {
        if (campus) {
            setEditingCampus(campus);
            setFormData({
                name: campus.name,
                short_name: campus.short_name,
                campus: campus.campus,
                lat: campus.lat,
                lng: campus.lng
            });
        } else {
            setEditingCampus(null);
            setFormData({
                name: "",
                short_name: "",
                campus: "Main",
                lat: 0,
                lng: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCampus(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editingCampus ? 'PATCH' : 'POST';
            const body = editingCampus ? { ...formData, id: editingCampus.id } : formData;
            
            const res = await fetch('/api/admin/universities', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchUniversities();
                handleCloseModal();
            } else {
                alert("Failed to save university");
            }
        } catch (err) {
            console.error("Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
        
        try {
            const res = await fetch(`/api/admin/universities?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUniversities();
            } else {
                alert("Failed to delete university");
            }
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    // Filter and then group
    const filteredUniversities = universities.filter(uni => 
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.campus.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filteredUniversities.reduce((acc: any, uni: any) => {
        const baseName = uni.name.split(' (')[0];
        if (!acc[baseName]) {
            acc[baseName] = {
                name: baseName,
                shortName: uni.short_name,
                campuses: []
            };
        }
        acc[baseName].campuses.push(uni);
        return acc;
    }, {});

    const groupedList = Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));

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
                            <Database className="text-emerald-400 w-6 h-6" />
                            <h1 className="text-4xl font-bold tracking-tight">University Database</h1>
                        </div>
                        <p className="text-white/60">
                            Manage institutional records and campus coordinates.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMigrate}
                            disabled={migrationStatus === "loading"}
                            className={`px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer ${
                                migrationStatus === "loading" ? "bg-white/5 opacity-50 !cursor-not-allowed" : "bg-white/5 hover:bg-white/10"
                            }`}
                        >
                            {migrationStatus === "loading" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : migrationStatus === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {migrationStatus === "loading" ? "Migrating..." : "Sync from JSON"}
                        </button>
                        
                        <button 
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Add University
                        </button>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="Search universities, short names, or campuses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-white/40">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p>Loading database...</p>
                </div>
            ) : groupedList.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/5 rounded-3xl">
                    <AlertCircle className="w-12 h-12 mb-4" />
                    <p className="text-xl font-medium">No universities found</p>
                    <p className="text-sm">Try adjusting your search or sync from JSON.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {groupedList.map((uni: any, index) => {
                            const isExpanded = expandedUnis.has(uni.name);
                            return (
                                <motion.div
                                    key={uni.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.01 }}
                                >
                                    <GlassCard className="overflow-hidden p-0 border-white/5 hover:border-white/10" hover={false}>
                                        <div 
                                            onClick={() => toggleExpand(uni.name)}
                                            className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                    <Globe className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold leading-tight">{uni.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold text-primary tracking-widest uppercase">{uni.shortName}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                                        <span className="text-xs text-white/40 font-medium">
                                                            {uni.campuses.length} {uni.campuses.length === 1 ? 'Campus' : 'Campuses'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {isExpanded ? <ChevronUp className="text-white/20" /> : <ChevronDown className="text-white/20" />}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5 bg-black/20"
                                                >
                                                    <div className="p-2">
                                                        {uni.campuses.map((campus: any) => (
                                                            <div 
                                                                key={campus.id}
                                                                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                                        <MapPin className="text-emerald-400 w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-white/90">{campus.campus}</span>
                                                                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">ID: {campus.id.split('-')[0]}</span>
                                                                        </div>
                                                                        <div className="flex gap-4 mt-0.5">
                                                                            <div className="flex items-baseline gap-1.5 font-mono text-[10px]">
                                                                                <span className="text-white/20 uppercase">Lat</span>
                                                                                <span className="text-white/50">{campus.lat.toFixed(4)}</span>
                                                                            </div>
                                                                            <div className="flex items-baseline gap-1.5 font-mono text-[10px]">
                                                                                <span className="text-white/20 uppercase">Lng</span>
                                                                                <span className="text-white/50">{campus.lng.toFixed(4)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                                    <button 
                                                                        onClick={() => handleOpenModal(campus)}
                                                                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(campus.id, `${campus.name} (${campus.campus})`)}
                                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-24">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <GlassCard className="border-white/10 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold">
                                        {editingCampus ? "Edit Campus" : "Add University"}
                                    </h2>
                                    <button onClick={handleCloseModal} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <X className="w-6 h-6 text-white/40" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">University Name</label>
                                        <input 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g. University of Toronto (St. George)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Short Name</label>
                                            <input 
                                                required
                                                value={formData.short_name}
                                                onChange={(e) => setFormData({...formData, short_name: e.target.value})}
                                                placeholder="e.g. UofT"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Campus</label>
                                            <input 
                                                required
                                                value={formData.campus}
                                                onChange={(e) => setFormData({...formData, campus: e.target.value})}
                                                placeholder="e.g. St. George"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Latitude</label>
                                            <input 
                                                required
                                                type="number"
                                                step="any"
                                                value={formData.lat}
                                                onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Longitude</label>
                                            <input 
                                                required
                                                type="number"
                                                step="any"
                                                value={formData.lng}
                                                onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-white/60"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={saving}
                                            className="flex-2 px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Save className="w-5 h-5" />
                                            )}
                                            {editingCampus ? "Save Changes" : "Create University"}
                                        </button>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
