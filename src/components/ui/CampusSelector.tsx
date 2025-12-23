"use client";

import GlassCard from "./GlassCard";
import { University } from "@/types";

interface CampusSelectorProps {
    universities: University[];
    selectedUniName: string;
    onChange: (name: string) => void;
    disabled?: boolean;
}

export default function CampusSelector({ universities, selectedUniName, onChange, disabled }: CampusSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Campus</h3>
            <div className="relative">
                <input
                    list="universities"
                    placeholder="Search your campus..."
                    value={selectedUniName}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/30"
                />
                <datalist id="universities">
                    {universities.map((uni, idx) => (
                        <option key={idx} value={uni.name} />
                    ))}
                </datalist>
            </div>
        </div>
    );
}
