"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ParsedClass, University, Day } from "@/types";
import universitiesData from "@/lib/data/universities.json";
import { motion } from "framer-motion";
import { Save, X, Plus, Trash2, User, MapPin, Calendar, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import FileUpload from "@/components/ui/FileUpload";
import { processSchedule } from "@/app/actions";
import Link from "next/link";

const universities = universitiesData as University[];

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [selectedCampus, setSelectedCampus] = useState("");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // Load user data
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            // Load profile
            const profileRes = await fetch("/api/user/profile");
            if (profileRes.ok) {
                const { profile } = await profileRes.json();
                if (profile) {
                    setSelectedUniversity(profile.university || "");
                    setSelectedCampus(profile.campus || "");
                }
            }

            // Load schedule
            const scheduleRes = await fetch("/api/user/schedule");
            if (scheduleRes.ok) {
                const { schedule } = await scheduleRes.json();
                if (schedule && schedule.parsed_classes) {
                    setClasses(schedule.parsed_classes);
                }
            }

            // Load user info
            const userRes = await fetch("/api/user/info");
            if (userRes.ok) {
                const { user: userData } = await userRes.json();
                if (userData) {
                    setFirstName(userData.first_name || "");
                    setLastName(userData.last_name || "");
                }
            }
        } catch (err) {
            console.error("Error loading user data:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Save user info
            await fetch("/api/user/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName }),
            });

            // Save profile
            await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    university: selectedUniversity,
                    campus: selectedCampus,
                }),
            });

            // Save schedule
            if (classes.length > 0) {
                await fetch("/api/user/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: "manual_schedule.json",
                        parsedClasses: classes,
                    }),
                });
            }

            setMessage({ type: "success", text: "Profile saved successfully!" });
        } catch (err) {
            console.error("Error saving profile:", err);
            setMessage({ type: "error", text: "Failed to save profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const addClass = () => {
        setClasses([
            ...classes,
            {
                name: "",
                days: [Day.MONDAY],
                startTime: "09:00",
                endTime: "10:30",
                location: "",
            },
        ]);
    };

    const removeClass = (index: number) => {
        setClasses(classes.filter((_, i) => i !== index));
    };

    const updateClass = (index: number, field: keyof ParsedClass, value: any) => {
        const updated = [...classes];
        updated[index] = { ...updated[index], [field]: value };
        setClasses(updated);
    };

    const toggleClassDay = (index: number, day: Day) => {
        const updated = [...classes];
        const currentDays = updated[index].days || [];
        
        if (currentDays.includes(day)) {
            // Remove day
            updated[index] = { 
                ...updated[index], 
                days: currentDays.filter(d => d !== day) 
            };
        } else {
            // Add day
            updated[index] = { 
                ...updated[index], 
                days: [...currentDays, day] 
            };
        }
        
        setClasses(updated);
    };

    const handleScheduleUpload = async (file: File) => {
        setUploading(true);
        setMessage(null);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            const base64 = await new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
            });

            // Parse schedule with AI
            const response = await processSchedule(base64, file.type);

            if (response.success && response.data) {
                setClasses(response.data);
                setMessage({ type: "success", text: `Parsed ${response.data.length} classes from your schedule!` });
            } else {
                setMessage({ type: "error", text: response.error || "Failed to parse schedule" });
            }
        } catch (err) {
            console.error("Error uploading schedule:", err);
            setMessage({ type: "error", text: "Error processing file. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    const getUniversityNames = () => {
        const uniqueNames = new Map<string, string>();
        universities.forEach((uni) => {
            if (!uniqueNames.has(uni.shortName)) {
                const baseName = uni.name.split(" (")[0];
                uniqueNames.set(uni.shortName, baseName);
            }
        });
        return Array.from(uniqueNames.values()).sort();
    };

    const getCampusOptions = () => {
        if (!selectedUniversity) return [];
        return universities
            .filter((uni) => uni.name.startsWith(selectedUniversity))
            .map((uni) => {
                const match = uni.name.match(/\(([^)]+)\)/);
                return match ? match[1] : "Main Campus";
            });
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-white/60">Manage your account and preferences</p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl ${
                            message.type === "success"
                                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                                : "bg-red-500/20 border border-red-500/30 text-red-400"
                        }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* Personal Info */}
                <GlassCard className="mb-6 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                        <input
                            type="email"
                            value={user.email || ""}
                            disabled
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 cursor-not-allowed"
                        />
                        <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                    </div>
                </GlassCard>

                {/* Preferences */}
                <GlassCard className="mb-6 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Preferences</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                University
                            </label>
                            <select
                                value={selectedUniversity}
                                onChange={(e) => {
                                    setSelectedUniversity(e.target.value);
                                    setSelectedCampus("");
                                }}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Select University</option>
                                {getUniversityNames().map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Campus
                            </label>
                            <select
                                value={selectedCampus}
                                onChange={(e) => setSelectedCampus(e.target.value)}
                                disabled={!selectedUniversity}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select Campus</option>
                                {getCampusOptions().map((campus) => (
                                    <option key={campus} value={campus}>
                                        {campus}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </GlassCard>

                {/* Schedule Editor */}
                <GlassCard className="mb-6 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">Schedule</h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={addClass}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Class
                            </button>
                        </div>
                    </div>

                    {/* Upload Schedule Section */}
                    <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-sm font-semibold mb-3">Upload New Schedule</h3>
                        <p className="text-xs text-white/60 mb-3">
                            Upload a screenshot or PDF of your schedule to automatically parse and update your classes.
                        </p>
                        {uploading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="ml-3 text-white/60">Parsing schedule with AI...</span>
                            </div>
                        ) : (
                            <FileUpload
                                onFileSelect={handleScheduleUpload}
                                uploadedFileName={undefined}
                                disabled={saving}
                            />
                        )}
                    </div>

                    {classes.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No classes added yet. Click "Add Class" to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-2 text-sm font-medium text-white/60">
                                            Course Name
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-white/60">
                                            Days
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-white/60">
                                            Start Time
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-white/60">
                                            End Time
                                        </th>
                                        <th className="text-left py-3 px-2 text-sm font-medium text-white/60">
                                            Location
                                        </th>
                                        <th className="w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((cls, index) => (
                                        <tr key={index} className="border-b border-white/5">
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={cls.name}
                                                    onChange={(e) =>
                                                        updateClass(index, "name", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    placeholder="CS 101"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {[Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY, Day.SUNDAY].map((day) => {
                                                        const shortDay = day.substring(0, 3);
                                                        const isSelected = cls.days?.includes(day);
                                                        return (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                onClick={() => toggleClassDay(index, day)}
                                                                className={`px-2 py-1 text-xs rounded transition-all ${
                                                                    isSelected
                                                                        ? 'bg-primary text-white'
                                                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                                }`}
                                                            >
                                                                {shortDay}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="time"
                                                    value={cls.startTime}
                                                    onChange={(e) =>
                                                        updateClass(index, "startTime", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="time"
                                                    value={cls.endTime}
                                                    onChange={(e) =>
                                                        updateClass(index, "endTime", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={cls.location}
                                                    onChange={(e) =>
                                                        updateClass(index, "location", e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    placeholder="Room 101"
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <button
                                                    onClick={() => removeClass(index)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>

                {/* Actions */}
                <div className="flex gap-4">
                    <AnimatedButton
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </AnimatedButton>
                    <button
                        onClick={async () => {
                            setMessage(null);
                            await loadUserData();
                            setMessage({ type: "success", text: "Reset to saved preferences!" });
                            setTimeout(() => setMessage(null), 3000);
                        }}
                        disabled={saving}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Reset
                    </button>
                </div>
            </div>
        </main>
    );
}
