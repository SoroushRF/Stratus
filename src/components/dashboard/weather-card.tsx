"use client";

import { Class, WeatherForecast, ClothingPlan } from "@/types";
import { Cloud, CloudRain, Sun, Thermometer, Clock, Shirt } from "lucide-react";

interface WeatherCardProps {
    cls: Class & { attire?: ClothingPlan };
    weather: WeatherForecast;
}

export function WeatherCard({ cls, weather }: WeatherCardProps) {
    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case "rain":
                return <CloudRain className="w-6 h-6 text-blue-400" />;
            case "clear":
                return <Sun className="w-6 h-6 text-yellow-400" />;
            default:
                return <Cloud className="w-6 h-6 text-zinc-400" />;
        }
    };

    return (
        <div className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/20 transition-all duration-300">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{cls.name}</h3>
                        <p className="text-sm text-muted-foreground">{cls.location}</p>
                    </div>
                </div>

                {cls.attire && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 w-fit">
                    <Shirt className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-zinc-300">
                      AI Outfit: {cls.attire.top}, {cls.attire.bottom}
                    </span>
                  </div>
                )}

                <div className="flex gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>{cls.startTime} - {cls.endTime}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 px-6 py-4 glass-dark rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-1">
                    {getWeatherIcon(weather.condition)}
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{weather.condition}</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-black">{weather.temp}°</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">At class start</span>
                </div>
            </div>
        </div>
    );
}
