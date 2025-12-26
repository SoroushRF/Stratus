"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Droplets, Wind, Thermometer, ChevronDown, ChevronUp, Shirt } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import WeatherSummary from "@/components/ui/WeatherSummary";
import PremiumBackground from "@/components/ui/PremiumBackground";
import { ClassAttireRecommendation, MasterRecommendation } from "@/types";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";

export default function AnalysisPage() {
    const router = useRouter();
    const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
    const [classAttireRecommendations, setClassAttireRecommendations] = useState<ClassAttireRecommendation[]>([]);
    const [masterRecommendation, setMasterRecommendation] = useState<MasterRecommendation | null>(null);
    const [fullWeatherData, setFullWeatherData] = useState<any>(null);
    const [collapsedClasses, setCollapsedClasses] = useState<Set<number>>(new Set());
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [universityName, setUniversityName] = useState<string>("");

    useEffect(() => {
        // Load analysis data from sessionStorage
        const analysisData = sessionStorage.getItem('analysisResults');
        if (analysisData) {
            const data = JSON.parse(analysisData);
            setClassWeatherMatches(data.classWeatherMatches || []);
            setClassAttireRecommendations(data.classAttireRecommendations || []);
            setMasterRecommendation(data.masterRecommendation || null);
            setFullWeatherData(data.fullWeatherData || null);
            setSelectedDay(data.selectedDay || "");
            setUniversityName(data.universityName || "");
        } else {
            // No data - redirect to home
            router.push('/');
        }
    }, [router]);

    const toggleClassCollapse = (index: number) => {
        setCollapsedClasses((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const getBackgroundCondition = (): "clear" | "clouds" | "rain" | "snow" => {
        if (!classWeatherMatches || classWeatherMatches.length === 0) return "clear";

        const conditions = classWeatherMatches
            .map(m => m.weather?.condition.toLowerCase() || "")
            .filter(c => c !== "");

        if (conditions.some(c => c.includes("snow"))) return "snow";
        if (conditions.some(c => c.includes("rain") || c.includes("drizzle") || c.includes("thunder"))) return "rain";
        if (conditions.some(c => c.includes("cloud") || c.includes("overcast"))) return "clouds";

        return "clear";
    };

    if (!classWeatherMatches.length && !masterRecommendation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen text-white relative">
            <PremiumBackground weatherCondition={getBackgroundCondition()} />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Analysis Results</h1>
                    <p className="text-white/60">
                        {universityName} • {selectedDay}
                    </p>
                </div>

                {/* Master Recommendation */}
                {masterRecommendation && (
                    <GlassCard className="mb-8 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-primary w-6 h-6" />
                            <h2 className="text-2xl font-bold">Master Recommendation</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Base Outfit</h3>
                                <p className="text-white/80">{masterRecommendation.baseOutfit}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Layering Strategy</h3>
                                <p className="text-white/80">{masterRecommendation.layeringStrategy}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Essential Accessories</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {masterRecommendation.essentialAccessories.map((item, i) => (
                                        <li key={i} className="text-white/80">{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Reasoning</h3>
                                <p className="text-white/80">{masterRecommendation.reasoning}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="w-4 h-4 text-primary" />
                                    <span>
                                        {masterRecommendation.weatherRange.minTemp}°C - {masterRecommendation.weatherRange.maxTemp}°C
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-primary" />
                                    <span>{masterRecommendation.weatherRange.conditions.join(", ")}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Weather Graph */}
                {fullWeatherData && (
                    <GlassCard className="mb-8 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Wind className="text-primary w-6 h-6" />
                            <h2 className="text-2xl font-bold">24-Hour Weather Forecast</h2>
                        </div>
                        <WeatherSummary matches={classWeatherMatches} fullWeatherData={fullWeatherData} />
                    </GlassCard>
                )}

                {/* Class-by-Class Recommendations */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Shirt className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold">Class-by-Class Breakdown</h2>
                    </div>

                    {classAttireRecommendations.map((rec, index) => (
                        <GlassCard key={index} className="p-6">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleClassCollapse(index)}
                            >
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-1">{rec.class.name}</h3>
                                    <p className="text-sm text-white/60">
                                        {rec.class.startTime} - {rec.class.endTime}
                                        {rec.class.location && ` • ${rec.class.location}`}
                                    </p>
                                </div>
                                <motion.div
                                    animate={{ rotate: collapsedClasses.has(index) ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-6 h-6 text-white/60" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {!collapsedClasses.has(index) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                            {rec.weather && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-white/60 mb-1">Temperature</p>
                                                        <p className="font-semibold">{rec.weather.temp}°C</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/60 mb-1">Feels Like</p>
                                                        <p className="font-semibold">{rec.weather.feelsLike}°C</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/60 mb-1">Condition</p>
                                                        <p className="font-semibold">{rec.weather.condition}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/60 mb-1">Wind</p>
                                                        <p className="font-semibold">{rec.weather.windSpeed} km/h</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="font-semibold mb-2">Recommendation</h4>
                                                <p className="text-white/80">{rec.attire.recommendation}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2">Reasoning</h4>
                                                <p className="text-white/80">{rec.attire.reasoning}</p>
                                            </div>

                                            {rec.attire.accessories.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Accessories</h4>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {rec.attire.accessories.map((item, i) => (
                                                            <li key={i} className="text-white/80">{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    ))}
                </div>

                {/* Back to Home Button */}
                <div className="mt-8">
                    <Link
                        href="/"
                        className="block w-full px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl transition-all font-medium text-center"
                    >
                        Analyze Another Day
                    </Link>
                </div>
            </div>
        </main>
    );
}
