"use client";

import { useState } from "react";

interface CampusSelectorProps {
    value: string;
    onChange: (value: string) => void;
    universities: Array<{ name: string; shortName: string }>;
    disabled?: boolean;
}

export default function CampusSelector({ value, onChange, universities, disabled = false }: CampusSelectorProps) {
    return (
        <div className="relative">
            <input
                type="text"
                list="universities"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Search for your campus..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            />
            <datalist id="universities">
                {universities.map((uni) => (
                    <option key={uni.name} value={uni.name} />
                ))}
            </datalist>
        </div>
    );
}
