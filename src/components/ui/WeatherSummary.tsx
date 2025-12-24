"use client";

import { motion } from "framer-motion";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { Cloud, Sparkles, Droplets, Plus } from "lucide-react";

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

            {/* Bar Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
                {validMatches.map((match, i) => {
                    const temp = match.weather!.temp;
                    // Calculate height percentage (min height 20%, max 100%)
                    const heightPercent = Math.max(20, Math.min(100, ((temp - minTemp) / range) * 80 + 20));

                    return (
                        <div key={i} className="flex flex-col items-center justify-end h-full w-full group relative">
                            {/* Weather Icon (Floating above) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 + 0.3 }}
                                className="mb-2 p-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm"
                            >
                                {getWeatherIcon(match.weather!.condition)}
                            </motion.div>

                            {/* The Bar */}
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${heightPercent}%`, opacity: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="w-full max-w-[40px] bg-gradient-to-t from-white/5 to-white/20 rounded-t-xl border-t border-x border-white/10 relative overflow-hidden group-hover:from-primary/20 group-hover:to-primary/40 transition-colors duration-300"
                            >
                                {/* Tooltip / Temp Label */}
                                <div className="absolute inset-0 flex items-start justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white shadow-black/50 drop-shadow-md">{temp.toFixed(1)}°</span>
                                </div>
                            </motion.div>

                            {/* Time & Course Label - Fixed height to ensure bar alignment */}
                            <div className="mt-2 h-[50px] flex flex-col items-center justify-start gap-1">
                                <span className="text-[10px] sm:text-xs text-white/40 font-mono font-medium tracking-wider">
                                    {match.class.startTime.split(' ')[0]}
                                </span>
                                <span className="text-[10px] text-white/70 font-bold text-center leading-tight max-w-[80px] line-clamp-2">
                                    {match.class.name}
                                </span>
                            </div>


                        </div>
                    );
                })}
            </div>
        </div>
    );
}
