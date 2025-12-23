"use client";

import { useState } from "react";
import { Class } from "@/types";
import { Check, Edit2, MapPin, Clock, Calendar } from "lucide-react";

interface ValidationFormProps {
    initialClasses: Class[];
    onConfirm: (classes: Class[]) => void;
}

export function ValidationForm({ initialClasses, onConfirm }: ValidationFormProps) {
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleUpdate = (id: string, updates: Partial<Class>) => {
        setClasses(classes.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Verify Your Schedule</h2>
                <p className="text-muted-foreground">We've parsed your schedule. Please confirm the details are correct.</p>
            </div>

            <div className="grid gap-4">
                {classes.map((cls) => (
                    <div key={cls.id} className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                {editingId === cls.id ? (
                                    <input
                                        className="bg-transparent border-b border-primary focus:outline-none text-xl font-bold w-full"
                                        value={cls.name}
                                        onChange={(e) => handleUpdate(cls.id, { name: e.target.value })}
                                    />
                                ) : (
                                    <h3 className="text-xl font-bold">{cls.name}</h3>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {editingId === cls.id ? (
                                        <input
                                            className="bg-transparent border-b border-white/20 focus:outline-none"
                                            value={`${cls.startTime} - ${cls.endTime}`}
                                            onChange={(e) => {
                                                const [start, end] = e.target.value.split(" - ");
                                                handleUpdate(cls.id, { startTime: start, endTime: end });
                                            }}
                                        />
                                    ) : (
                                        <span>{cls.startTime} - {cls.endTime}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {editingId === cls.id ? (
                                        <input
                                            className="bg-transparent border-b border-white/20 focus:outline-none"
                                            value={cls.location}
                                            onChange={(e) => handleUpdate(cls.id, { location: e.target.value })}
                                        />
                                    ) : (
                                        <span>{cls.location}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setEditingId(editingId === cls.id ? null : cls.id)}
                                className="p-3 rounded-full hover:bg-white/5 transition-colors border border-white/5"
                            >
                                {editingId === cls.id ? <Check className="w-5 h-5 text-emerald-400" /> : <Edit2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={() => onConfirm(classes)}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all"
                >
                    Confirm Schedule & View Recommendations
                </button>
            </div>
        </div>
    );
}
