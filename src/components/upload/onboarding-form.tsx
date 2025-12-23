"use client";

import { useState } from "react";
import { CommuteMethod } from "@/types";
import { User, Mail, MapPin, Navigation, School } from "lucide-react";
import universities from "@/lib/data/universities.json";

interface OnboardingFormProps {
    onComplete: (data: {
        email: string;
        name: string;
        campusLocation: string;
        homeLocation: string;
        commuteMethod: CommuteMethod;
    }) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        campusLocation: universities[0].name,
        homeLocation: "",
        commuteMethod: CommuteMethod.TRANSIT,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Finalize Your Profile</h2>
                <p className="text-muted-foreground">We need a few more details to customize your commute alerts.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Full Name
                        </label>
                        <input
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" /> Email Address
                        </label>
                        <input
                            required
                            type="email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <School className="w-4 h-4 text-primary" /> Campus Location
                    </label>
                    <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                        value={formData.campusLocation}
                        onChange={(e) => setFormData({ ...formData, campusLocation: e.target.value })}
                    >
                        {universities.map((u) => (
                            <option key={u.name} value={u.name} className="bg-background">
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Home Location (or City)
                    </label>
                    <input
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="e.g. 123 Street, Toronto"
                        value={formData.homeLocation}
                        onChange={(e) => setFormData({ ...formData, homeLocation: e.target.value })}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-primary" /> Preferred Commute Method
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.values(CommuteMethod).map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setFormData({ ...formData, commuteMethod: method })}
                                className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                                    formData.commuteMethod === method
                                        ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Save Profile & See Dashboard
                    </button>
                </div>
            </form>
        </div>
    );
}
