"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { Cloud, Sun, Moon, Snowflake, Droplets } from "lucide-react";

interface WeatherSummaryProps {
    matches: ClassWeatherMatch[];
    fullWeatherData?: any; // Full 24-hour weather forecast from API
}

export default function WeatherSummary({ matches, fullWeatherData }: WeatherSummaryProps) {
    const validMatches = matches.filter(m => m.weather);
    if (validMatches.length === 0) return null;

    const [hoverData, setHoverData] = useState<{ x: number; y: number; temp: number; feelsLike: number; hour: number; condition: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const temps = validMatches.map(m => m.weather!.temp);
    const minTemp = Math.min(...temps) - 6; 
    const maxTemp = Math.max(...temps) + 4;
    const range = maxTemp - minTemp || 1;

    const getY = (temp: number) => 100 - (((temp - minTemp) / range) * 50 + 15);

    // Use full API data if available, otherwise fall back to interpolation
    const hourPoints = Array.from({ length: 24 }, (_, i) => {
        // First, try to get data from full weather API
        if (fullWeatherData?.hourlyForecasts) {
            const apiData = fullWeatherData.hourlyForecasts.find((forecast: any) => {
                const forecastHour = parseInt(forecast.hour.split(':')[0]);
                return forecastHour === i;
            });
            
            if (apiData) {
                return {
                    x: (i / 23) * 100,
                    yActual: getY(apiData.temp),
                    yFeels: getY(apiData.feelsLike),
                    temp: apiData.temp,
                    feelsLike: apiData.feelsLike,
                    condition: apiData.condition,
                    hour: i
                };
            }
        }

        // Fallback: Check if there's a class at this hour
        const match = validMatches.find(m => parseInt(m.class.startTime.split(':')[0]) === i);
        
        if (match) {
            const actual = match.weather!.temp;
            const feelsLike = match.weather!.feelsLike;
            return {
                x: (i / 23) * 100,
                yActual: getY(actual),
                yFeels: getY(feelsLike),
                temp: actual,
                feelsLike: feelsLike,
                condition: match.weather!.condition,
                hour: i
            };
        } else {
            // Linear interpolation as last resort
            const prevMatch = [...validMatches].reverse().find(m => parseInt(m.class.startTime.split(':')[0]) < i);
            const nextMatch = validMatches.find(m => parseInt(m.class.startTime.split(':')[0]) > i);
            
            let actual, feelsLike;
            if (prevMatch && nextMatch) {
                const prevHour = parseInt(prevMatch.class.startTime.split(':')[0]);
                const nextHour = parseInt(nextMatch.class.startTime.split(':')[0]);
                const ratio = (i - prevHour) / (nextHour - prevHour);
                actual = prevMatch.weather!.temp + (nextMatch.weather!.temp - prevMatch.weather!.temp) * ratio;
                feelsLike = prevMatch.weather!.feelsLike + (nextMatch.weather!.feelsLike - prevMatch.weather!.feelsLike) * ratio;
            } else if (prevMatch) {
                actual = prevMatch.weather!.temp;
                feelsLike = prevMatch.weather!.feelsLike;
            } else if (nextMatch) {
                actual = nextMatch.weather!.temp;
                feelsLike = nextMatch.weather!.feelsLike;
            } else {
                actual = (minTemp + maxTemp) / 2;
                feelsLike = actual - 1;
            }
            
            return {
                x: (i / 23) * 100,
                yActual: getY(actual),
                yFeels: getY(feelsLike),
                temp: actual,
                feelsLike: feelsLike,
                condition: prevMatch?.weather!.condition || "clear",
                hour: i
            };
        }
    });

    // Simple Bézier smoothing - adjusted to 2.0 for smoother curves
    const getSmoothedPath = (data: {x: number, y: number}[]) => {
        return data.reduce((acc, point, i, a) => {
            if (i === 0) return `M ${point.x},${point.y}`;
            const p1 = a[i - 1];
            const p2 = point;
            const cp1x = p1.x + (p2.x - p1.x) / 2.0;
            const cp2x = p2.x - (p2.x - p1.x) / 2.0;
            return `${acc} C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
        }, "");
    };

    const actualLine = getSmoothedPath(hourPoints.map(p => ({ x: p.x, y: p.yActual })));
    const feelsLine = getSmoothedPath(hourPoints.map(p => ({ x: p.x, y: p.yFeels })));
    const smoothArea = `${actualLine} L 100,100 L 0,100 Z`;

    const getWeatherIcon = (condition: string, hour: number) => {
        const c = condition.toLowerCase();
        const isNight = hour < 6 || hour > 20;
        if (c.includes("clear") || c.includes("sun")) return isNight ? <Moon className="w-4 h-4 text-blue-200" /> : <Sun className="w-4 h-4 text-yellow-400 fill-yellow-400" />;
        if (c.includes("snow")) return <Snowflake className="w-4 h-4 text-white" />;
        if (c.includes("rain")) return <Droplets className="w-4 h-4 text-blue-400 fill-current" />;
        return <Cloud className="w-4 h-4 text-slate-400" />;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const graphWidth = rect.width - 48;
        const mouseX = Math.max(0, Math.min(graphWidth, e.clientX - rect.left));
        const hourIndex = Math.round((mouseX / graphWidth) * 23);
        const data = hourPoints[hourIndex];
        
        setHoverData({
            x: (hourIndex / 23) * graphWidth,
            y: (data.yActual / 100) * rect.height,
            temp: data.temp,
            feelsLike: data.feelsLike,
            hour: hourIndex,
            condition: data.condition
        });
    };

    return (
        <div className="w-full flex flex-col select-none">
            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverData(null)}
                className="relative h-80 bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
            >
                {/* 1. WEATHER SIGNS */}
                <div className="absolute top-6 left-0 right-12 flex justify-between px-10 z-20 pointer-events-none">
                    {[0, 4, 8, 12, 16, 20, 23].map((h) => (
                        <div key={h} className="flex flex-col items-center opacity-70">
                            {getWeatherIcon(hourPoints[h].condition, h)}
                        </div>
                    ))}
                </div>

                {/* 2. LEGEND */}
                <div className="absolute top-[68px] left-6 flex flex-col gap-1 z-20 pointer-events-none opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 rounded-full bg-[#93c5fd]" />
                        <span className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 rounded-full bg-[#a855f7]" />
                        <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">Feels Like</span>
                    </div>
                </div>

                {/* 3. RIGHT SIDE DEGREES */}
                <div className="absolute right-6 top-14 bottom-0 flex flex-col justify-between py-10 z-20 pointer-events-none text-[10px] font-bold text-white/10">
                    <span>{maxTemp.toFixed(0)}°</span>
                    <span>{minTemp.toFixed(0)}°</span>
                </div>

                {/* 4. The Shelf Border */}
                <div className="absolute top-14 left-0 right-0 h-px bg-white/10 z-10" />
                
                {/* 5. BACKGROUND GRID */}
                <svg className="absolute inset-0 w-full h-full pt-14 pr-12 pointer-events-none opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[25, 50, 75].map(x => (
                        <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="white" strokeWidth="0.2" />
                    ))}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="white" strokeWidth="0.4" strokeDasharray="1.5,2.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.4" strokeDasharray="1.5,2.5" />
                    <line x1="0" y1="80" x2="100" y2="80" stroke="white" strokeWidth="0.4" strokeDasharray="1.5,2.5" />
                </svg>

                {/* 6. The Graph Area */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pt-14 pr-12">
                    <defs>
                        <linearGradient id="appleFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={smoothArea} fill="url(#appleFill)" />
                    <motion.path 
                        d={feelsLine} 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="2.5" 
                        strokeOpacity="0.5"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <motion.path 
                        d={actualLine} 
                        fill="none" 
                        stroke="#93c5fd" 
                        strokeWidth="3" 
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* 7. Interactive Tooltip */}
                <AnimatePresence>
                    {hoverData && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-30">
                            <div className="absolute top-4" style={{ left: hoverData.x, transform: "translateX(-50%)" }}>
                                <span className="text-[11px] font-bold text-white tracking-tight">{hoverData.hour}:00</span>
                            </div>

                            <div className="absolute w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-[#1e293b] shadow-[0_0_12px_rgba(147,197,253,0.8)]" style={{ left: hoverData.x, top: "51px", transform: "translateX(-50%)" }} />

                            <div className="absolute top-14 bottom-0 w-[0.5px] bg-white/20" style={{ left: hoverData.x }} />
                            
                            <div 
                                className="absolute bg-white text-black px-3 py-1.5 rounded-2xl flex flex-col items-center shadow-2xl transition-all"
                                style={{ 
                                    left: hoverData.x, 
                                    top: hoverData.y + 40,
                                    transform: hoverData.hour > 18 ? "translateX(-110%)" : "translateX(-50%)" 
                                }}
                            >
                                <span className="text-[13px] font-black leading-none">{hoverData.temp.toFixed(1)}°</span>
                                <span className="text-[8px] font-bold text-purple-600 mt-1 uppercase tracking-tighter">Feels {hoverData.feelsLike.toFixed(1)}°</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}