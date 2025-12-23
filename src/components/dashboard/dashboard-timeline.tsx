"use client";

import { Class, WeatherForecast } from "@/types";
import { WeatherCard } from "./weather-card";

interface DashboardTimelineProps {
    schedule: Array<{
        cls: Class;
        weather: WeatherForecast;
    }>;
}

export function DashboardTimeline({ schedule }: DashboardTimelineProps) {
    return (
        <div className="relative space-y-8 max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-[20px] md:left-[50%] top-4 bottom-4 w-[1px] bg-gradient-to-b from-primary/50 via-white/10 to-transparent hidden md:block" />

            {schedule.map((item, index) => (
                <div
                    key={item.cls.id}
                    className={`relative flex items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                        }`}
                >
                    {/* Milestone Dot */}
                    <div className="absolute left-[20px] md:left-[50%] -translate-x-1/2 w-4 h-4 rounded-full border-2 border-primary bg-background z-10 hidden md:block shadow-[0_0_15px_rgba(139,92,246,0.5)]" />

                    {/* Card Wrapper */}
                    <div className="flex-1 w-full">
                        <div className={`animate-in fade-in slide-in-from-${index % 2 === 0 ? "left" : "right"}-8 duration-1000`}>
                            <WeatherCard cls={item.cls} weather={item.weather} />
                        </div>
                    </div>

                    {/* Spacer for reverse layout */}
                    <div className="flex-1 hidden md:block" />
                </div>
            ))}
        </div>
    );
}
