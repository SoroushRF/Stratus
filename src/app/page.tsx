"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    Calendar,
    MapPin,
    Plus,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronDown,
    Sparkles,
    ArrowRight
} from "lucide-react";

import { processSchedule, generateAttireRecommendationsAction, generateMasterRecommendationAction } from "@/app/actions";
import { ParsedClass, University, ClassAttireRecommendation, MasterRecommendation } from "@/types";
import universitiesData from "@/lib/data/universities.json";
import { getWeatherForecast } from "@/lib/services/weather";
import { matchClassesToWeather, filterClassesByDay, ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { resolveAnalysisDay, getDateForAnalysisDay } from "@/lib/utils/dateHelpers";

import PremiumBackground from "@/components/ui/PremiumBackground";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import CampusSelector from "@/components/ui/CampusSelector";
import FileUpload from "@/components/ui/FileUpload";
import WeatherSummary from "@/components/ui/WeatherSummary";

const universities = universitiesData as University[];

export default function Home() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
    const [classAttireRecommendations, setClassAttireRecommendations] = useState<ClassAttireRecommendation[]>([]);
    const [masterRecommendation, setMasterRecommendation] = useState<MasterRecommendation | null>(null);
    const [collapsedClasses, setCollapsedClasses] = useState<Set<number>>(new Set());
    const [selectedUniName, setSelectedUniName] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("today");
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

    // Helper functions (Unchanged Logic)
    const getWeatherIcon = (condition: string): React.ReactNode => {
        const c = condition.toLowerCase();
        if (c.includes("clear") || c.includes("sun")) return <Sparkles className="w-5 h-5 text-yellow-400" />;
        if (c.includes("cloud")) return <Cloud className="w-5 h-5 text-gray-400" />;
        if (c.includes("rain") || c.includes("drizzle")) return <Droplets className="w-5 h-5 text-blue-400" />;
        if (c.includes("snow")) return <Plus className="w-5 h-5 text-white animate-spin-slow" />;
        if (c.includes("thunder") || c.includes("storm")) return <AlertCircle className="w-5 h-5 text-purple-400" />;
        return <Cloud className="w-5 h-5 text-blue-300" />;
    };

    const getTempLabel = (temp: number): string => {
        if (temp < 0) return "FREEZING";
        if (temp < 10) return "COLD";
        if (temp < 20) return "MILD";
        if (temp < 30) return "WARM";
        return "HOT";
    };

    const toggleClass = (idx: number) => {
        const newCollapsed = new Set(collapsedClasses);
        if (newCollapsed.has(idx)) {
            newCollapsed.delete(idx);
        } else {
            newCollapsed.add(idx);
        }
        setCollapsedClasses(newCollapsed);
    };

    const getDayOptions = () => {
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const today = new Date();
        const todayIndex = today.getDay();

        const options = [];
        options.push({ value: "today", label: `Today (${days[todayIndex]})` });
        const tomorrowIndex = (todayIndex + 1) % 7;
        options.push({ value: "tomorrow", label: `Tomorrow (${days[tomorrowIndex]})` });

        for (let i = 2; i < 7; i++) {
            const dayIndex = (todayIndex + i) % 7;
            const dayName = days[dayIndex];
            options.push({ value: dayName, label: dayName });
        }
        return options;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const mimeType = file.type;
                setUploadedFile({ base64: base64Data, mimeType, name: file.name });
            };
        } catch (err) {
            setError("Error reading file.");
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setStatus("loading");
        setError(null);

        try {
            setLoadingStep("Parsing schedule with AI...");
            const response = await processSchedule(uploadedFile.base64, uploadedFile.mimeType);

            if (response.success && response.data) {
                const parsedClasses = response.data;
                setClasses(parsedClasses);

                const university = universities.find(u => u.name === selectedUniName);
                if (!university) {
                    setStatus("error");
                    setError("Selected university not found. Please select a valid campus from the list.");
                    setLoadingStep("");
                    return;
                }

                const actualDay = resolveAnalysisDay(selectedDay);
                const analysisDate = getDateForAnalysisDay(selectedDay);
                const dayClasses = filterClassesByDay(parsedClasses, actualDay);

                if (dayClasses.length === 0) {
                    setStatus("error");
                    setError(`No classes found for ${getDayOptions().find(opt => opt.value === selectedDay)?.label || selectedDay}. Try selecting a different day.`);
                    setLoadingStep("");
                    return;
                }

                setLoadingStep(`Fetching weather data for ${university.shortName}...`);
                let weatherData;
                try {
                    weatherData = await getWeatherForecast(
                        university.lat,
                        university.lng,
                        analysisDate
                    );
                } catch (weatherError) {
                    console.error("Weather fetch failed:", weatherError);
                    setStatus("error");
                    setError("Failed to fetch weather data. Please try again.");
                    setLoadingStep("");
                    return;
                }

                const matches = matchClassesToWeather(dayClasses, weatherData);
                setClassWeatherMatches(matches);

                const hasWeatherData = matches.some(m => m.weather !== null);
                if (!hasWeatherData) {
                    setStatus("error");
                    setError("No weather data available for the selected date. The date might be outside the available range.");
                    setLoadingStep("");
                    return;
                }

                setLoadingStep(`Generating clothing recommendations (${matches.length} classes)...`);
                const attireResponse = await generateAttireRecommendationsAction(matches);

                if (attireResponse.success && attireResponse.data) {
                    setClassAttireRecommendations(attireResponse.data);
                    setLoadingStep("Creating master outfit recommendation...");
                    const masterResponse = await generateMasterRecommendationAction(attireResponse.data);

                    if (masterResponse.success && masterResponse.data) {
                        setMasterRecommendation(masterResponse.data);
                    }
                } else {
                    setStatus("error");
                    setError("Failed to generate clothing recommendations.");
                    setLoadingStep("");
                    return;
                }

                setStatus("success");
                setLoadingStep("");
            } else {
                setStatus("error");
                setError(response.error || "Failed to parse schedule.");
                setLoadingStep("");
            }
        } catch (err) {
            setStatus("error");
            setError("Error during analysis.");
            setLoadingStep("");
        }
    };

    return (
        <main className="min-h-screen relative text-white selection:bg-primary/30 py-12 px-6">
            <PremiumBackground />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest text-primary uppercase"
                    >
                        <Sparkles className="w-3 h-3" />
                        Astromatic Intelligence
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-glow"
                    >
                        Stratus
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 text-lg max-w-md mx-auto"
                    >
                        Sync your schedule with the elements. Get personalized attire for every class.
                    </motion.p>
                </header>

                <AnimatePresence mode="wait">
                    {status === "idle" || status === "error" || status === "loading" ? (
                        <motion.div
                            key="input-stage"
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <GlassCard delay={0.3} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <CampusSelector
                                        universities={universities}
                                        selectedUniName={selectedUniName}
                                        onChange={setSelectedUniName}
                                        disabled={status === "loading"}
                                    />

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Analysis Day</h3>
                                        <select
                                            value={selectedDay}
                                            onChange={(e) => setSelectedDay(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white appearance-none cursor-pointer"
                                        >
                                            {getDayOptions().map((option, idx) => (
                                                <option key={idx} value={option.value} className="bg-background text-white">{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <FileUpload
                                    onFileChange={handleFileChange}
                                    uploadedFileName={uploadedFile?.name}
                                    disabled={status === "loading" || !selectedUniName}
                                    status={status}
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <div className="pt-4 border-t border-white/10">
                                    <AnimatedButton
                                        onClick={handleAnalyze}
                                        disabled={status === "loading" || !selectedUniName || !uploadedFile}
                                        className="w-full h-14 text-lg group"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {status === "loading" ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Sparkles className="w-5 h-5" />
                                                    </motion.div>
                                                    <span>Analyzing Elements...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Analyze My Day</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                    </AnimatedButton>

                                    {status === "loading" && (
                                        <p className="text-center text-xs text-white/30 mt-4 animate-pulse">
                                            {loadingStep}
                                        </p>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results-stage"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            {/* Actions bar */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-glow-blue">Daily Forecast</h2>
                                    <p className="text-white/40 text-sm">Campus: {selectedUniName}</p>
                                </div>
                                <AnimatedButton variant="outline" onClick={() => setStatus("idle")} className="text-sm py-2">
                                    Upload New Schedule
                                </AnimatedButton>
                            </div>

                            {/* Master Outfit Recommendation */}
                            {masterRecommendation && (
                                <GlassCard className="!p-0 overflow-hidden relative group" hover={false}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                                    <div className="relative p-8 space-y-8">
                                        <div className="flex flex-wrap items-start justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                    <Sparkles className="w-4 h-4" />
                                                    MASTER OUTFIT
                                                </div>
                                                <h3 className="text-3xl font-bold">{masterRecommendation.baseOutfit}</h3>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-3xl font-bold text-white/90">
                                                    {masterRecommendation.weatherRange.minTemp}°<span className="text-white/30 mx-1">/</span>{masterRecommendation.weatherRange.maxTemp}°C
                                                </div>
                                                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Temperature Window</div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8 text-sm">
                                            <div className="space-y-2">
                                                <div className="text-white/40 font-medium flex items-center gap-2 uppercase tracking-tighter">
                                                    Layering Intent
                                                </div>
                                                <p className="text-white/80 leading-relaxed text-base italic">
                                                    "{masterRecommendation.layeringStrategy}"
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-white/40 font-medium uppercase tracking-tighter">
                                                    Core Accessories
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {masterRecommendation.essentialAccessories.map((acc, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70">
                                                            {acc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-primary/80 italic text-sm">
                                            💡 {masterRecommendation.reasoning}
                                        </div>
                                    </div>
                                </GlassCard>
                            )}

                            {/* Weather Summary Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Atmospheric Trend
                                </h3>
                                <GlassCard>
                                    <WeatherSummary matches={classWeatherMatches} />
                                </GlassCard>
                            </div>

                            {/* Class Timeline */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Course Timeline
                                </h3>

                                <div className="space-y-4">
                                    {classAttireRecommendations.map((rec, idx) => {
                                        const isCollapsed = collapsedClasses.has(idx);
                                        return (
                                            <GlassCard key={idx} className="!p-0 border-l-4 border-l-primary/50 overflow-hidden" hover={!isCollapsed}>
                                                <div
                                                    onClick={() => toggleClass(idx)}
                                                    className="p-5 cursor-pointer flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="hidden md:block text-white/30 font-mono text-sm">
                                                            {rec.class.startTime}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg">{rec.class.name}</h4>
                                                            <div className="flex items-center gap-3 text-sm text-white/50">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {rec.class.location || "On Campus"}
                                                                </span>
                                                                {rec.weather && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Thermometer className="w-3 h-3" />
                                                                        {rec.weather.temp}°C
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {rec.weather && (
                                                            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-xs font-medium border border-white/5">
                                                                {getWeatherIcon(rec.weather.condition)}
                                                                <span className="uppercase">{rec.weather.condition}</span>
                                                            </div>
                                                        )}
                                                        {isCollapsed ? <ChevronRight className="w-5 h-5 text-white/20" /> : <ChevronDown className="w-5 h-5 text-primary" />}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {!isCollapsed && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-white/10 p-6 bg-white/[0.02]"
                                                        >
                                                            <div className="grid md:grid-cols-3 gap-8">
                                                                {/* Weather Details */}
                                                                <div className="space-y-4">
                                                                    <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Atmosphere</div>
                                                                    {rec.weather ? (
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-white/50">Condition</span>
                                                                                <span className="font-medium flex items-center gap-2">
                                                                                    {getWeatherIcon(rec.weather.condition)}
                                                                                    {rec.weather.condition}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-white/50">Feels Like</span>
                                                                                <span className="font-medium">{rec.weather.feelsLike}°C</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-white/50">Wind Speed</span>
                                                                                <span className="font-medium">{rec.weather.windSpeed} km/h</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <span className="text-white/50">Humidity</span>
                                                                                <span className="font-medium">{rec.weather.humidity}%</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-white/20 italic">Weather data unavailable</p>
                                                                    )}
                                                                </div>

                                                                {/* Recommendation */}
                                                                <div className="md:col-span-2 space-y-4">
                                                                    <div className="text-xs font-bold text-white/30 uppercase tracking-widest">Attire Strategy</div>
                                                                    <div className={`p-5 rounded-2xl border ${rec.attire.priority === "essential" ? "bg-red-500/10 border-red-500/20" : "bg-primary/10 border-primary/20"}`}>
                                                                        <div className="flex items-start gap-3">
                                                                            <CheckCircle2 className={`w-5 h-5 mt-1 ${rec.attire.priority === "essential" ? "text-red-400" : "text-primary"}`} />
                                                                            <div className="space-y-3">
                                                                                <p className="font-bold text-lg">{rec.attire.recommendation}</p>
                                                                                <p className="text-sm text-white/60 leading-relaxed italic">"{rec.attire.reasoning}"</p>
                                                                                {rec.attire.accessories.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                                                        {rec.attire.accessories.map((acc, i) => (
                                                                                            <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/80">
                                                                                                {acc}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </GlassCard>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Detailed Visualization Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Wind className="w-5 h-5 text-primary" />
                                    Atmospheric Flow
                                </h3>

                                <GlassCard className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10 text-white/30 text-xs uppercase tracking-widest">
                                                <th className="pb-4 font-medium italic">Station</th>
                                                <th className="pb-4 font-medium italic">Temperature</th>
                                                <th className="pb-4 font-medium italic text-center">Condition</th>
                                                <th className="pb-4 font-medium italic text-right">Fluidity (Wind/Hum)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {classWeatherMatches.map((match, idx) => {
                                                const weather = match.weather;
                                                if (!weather) return null;
                                                return (
                                                    <tr key={idx} className="border-b border-white/5 last:border-0 group">
                                                        <td className="py-4">
                                                            <div className="font-bold group-hover:text-primary transition-colors">{match.class.startTime}</div>
                                                            <div className="text-xs text-white/40">{match.class.name}</div>
                                                        </td>
                                                        <td className="py-4 font-bold text-lg">
                                                            {weather.temp.toFixed(1)}°C
                                                            <div className="text-[10px] text-white/30 font-normal uppercase">Feels {weather.feelsLike.toFixed(1)}°</div>
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex flex-col items-center">
                                                                {getWeatherIcon(weather.condition)}
                                                                <span className="text-[10px] text-white/40 mt-1 uppercase">{weather.condition}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-medium">{weather.humidity}% Hum</span>
                                                                <span className="text-xs text-white/40">{weather.windSpeed.toFixed(1)} km/h</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <footer className="pt-12 border-t border-white/5 text-center space-y-4">
                    <p className="text-white/20 text-xs tracking-widest uppercase">
                        Core Engine: Gemini 2.5 Flash Lite • Precision Weather Sync
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-primary/20" />
                        <div className="w-1 h-1 rounded-full bg-primary/20" />
                    </div>
                </footer>
            </div>
        </main>
    );
}

