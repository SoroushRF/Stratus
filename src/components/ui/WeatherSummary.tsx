"use client";

import { motion } from "framer-motion";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { Cloud, Sparkles, Droplets, AlertCircle, Plus } from "lucide-react";

interface WeatherSummaryProps {
    matches: ClassWeatherMatch[];
}

export default function WeatherSummary({ matches }: WeatherSummaryProps) {
    const validMatches = matches.filter(m => m.weather);
    if (validMatches.length === 0) return null;

    const temps = validMatches.map(m => m.weather!.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    const getWeatherIcon = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes("clear") || c.includes("sun")) return <Sparkles className="w-4 h-4 text-yellow-400" />;
        if (c.includes("cloud")) return <Cloud className="w-4 h-4 text-gray-400" />;
        if (c.includes("rain") || c.includes("drizzle")) return <Droplets className="w-4 h-4 text-blue-400" />;
        return <Cloud className="w-4 h-4 text-blue-300" />;
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "High", value: `${maxTemp.toFixed(1)}°C`, icon: <Plus className="text-red-400" /> },
                    { label: "Low", value: `${minTemp.toFixed(1)}°C`, icon: <Plus className="text-blue-400 rotate-45" /> },
                    { label: "Humidity", value: `${Math.round(validMatches.reduce((s, m) => s + m.weather!.humidity, 0) / validMatches.length)}%`, icon: <Droplets className="text-blue-300" /> },
                    { label: "Wind", value: `${Math.max(...validMatches.map(m => m.weather!.windSpeed)).toFixed(1)}k/h`, icon: <Plus className="text-gray-400" /> },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{stat.label}</span>
                            {stat.icon && <div className="scale-75 opacity-50">{stat.icon}</div>}
                        </div>
                        <div className="text-xl font-bold">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="relative h-24 flex items-end justify-between px-2 pt-8">
                {/* Timeline Path */}
                <div className="absolute top-[60%] left-0 right-0 h-px bg-white/10" />

                {validMatches.map((match, i) => {
                    const temp = match.weather!.temp;
                    const height = ((temp - minTemp) / range) * 40 + 20; // 20% to 60% height

                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${height}%`, opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
                            className="relative flex flex-col items-center group w-full"
                        >
                            {/* Temp Node */}
                            <div className="absolute top-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,183,255,0.8)] -translate-y-1" />

                            {/* Label */}
                            <div className="absolute -top-6 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-primary scale-90 px-1 rounded">
                                {temp.toFixed(1)}°
                            </div>

                            {/* Icon Overlay */}
                            <div className="absolute -top-12 scale-75">
                                {getWeatherIcon(match.weather!.condition)}
                            </div>

                            {/* Time */}
                            <div className="absolute -bottom-6 text-[9px] text-white/30 font-mono">
                                {match.class.startTime.split(' ')[0]}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
