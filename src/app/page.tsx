// Final Integration Build [11:43 PM]
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { processSchedule, getWeatherForecastAction, generateAttireRecommendationsAction, generateMasterRecommendationAction } from "@/app/actions";
import { ParsedClass, University, ClassAttireRecommendation, MasterRecommendation } from "@/types";
import universitiesData from "@/lib/data/universities.json";
import { matchClassesToWeather, filterClassesByDay, ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { resolveAnalysisDay, getDateForAnalysisDay } from "@/lib/utils/dateHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Sparkles, Droplets, MapPin, Calendar, ChevronDown, ChevronUp, AlertCircle, Shirt, Wind, Thermometer, LogIn } from "lucide-react";

// UI Components
import PremiumBackground from "@/components/ui/PremiumBackground";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import CampusSelector from "@/components/ui/CampusSelector";
import FileUpload from "@/components/ui/FileUpload";
import WeatherSummary from "@/components/ui/WeatherSummary";

const universities = universitiesData as University[];

export default function Home() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
    const [fullWeatherData, setFullWeatherData] = useState<any>(null); // Store complete 24-hour forecast
    const [classAttireRecommendations, setClassAttireRecommendations] = useState<ClassAttireRecommendation[]>([]);
    const [masterRecommendation, setMasterRecommendation] = useState<MasterRecommendation | null>(null);
    const [collapsedClasses, setCollapsedClasses] = useState<Set<number>>(new Set());
    
    // Two-tier selection: University → Campus
    const [selectedUniversity, setSelectedUniversity] = useState<string>(""); // e.g., "University of Toronto"
    const [selectedCampus, setSelectedCampus] = useState<string>(""); // e.g., "St. George"
    
    const [selectedDay, setSelectedDay] = useState<string>("today");
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false); // Track if we've loaded saved data
    const [usesSavedSchedule, setUsesSavedSchedule] = useState(true); // Toggle between saved/upload
    const [savedScheduleFileName, setSavedScheduleFileName] = useState<string | null>(null);

    // Auto-load saved data when user logs in
    useEffect(() => {
        if (user && !authLoading && !dataLoaded) {
            loadSavedData();
        }
    }, [user, authLoading, dataLoaded]);

    // Auto-save for first-time users only (when they don't have saved preferences yet)
    // This ensures their first analysis saves their data
    useEffect(() => {
        if (user && !savedScheduleFileName && selectedUniversity && selectedCampus && dataLoaded) {
            // First-time user with selections - save as their initial preferences
            saveInitialPreferences();
        }
    }, [selectedUniversity, selectedCampus, user, savedScheduleFileName, dataLoaded]);

    const saveInitialPreferences = async () => {
        if (!selectedUniversity || !selectedCampus) return;
        
        try {
            await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    university: selectedUniversity,
                    campus: selectedCampus,
                }),
            });
            console.log('✅ Saved initial preferences');
        } catch (err) {
            console.error('Error saving initial preferences:', err);
        }
    };

    const loadSavedData = async () => {
        try {
            // Load profile
            const profileRes = await fetch('/api/user/profile');
            if (profileRes.ok) {
                const { profile } = await profileRes.json();
                if (profile) {
                    setSelectedUniversity(profile.university);
                    setSelectedCampus(profile.campus);
                    console.log('✅ Loaded saved profile:', profile);
                }
            }

            // Load schedule
            const scheduleRes = await fetch('/api/user/schedule');
            if (scheduleRes.ok) {
                const { schedule } = await scheduleRes.json();
                if (schedule) {
                    setClasses(schedule.parsed_classes);
                    setSavedScheduleFileName(schedule.file_name);
                    setUsesSavedSchedule(true);
                    console.log('✅ Loaded saved schedule:', schedule.file_name);
                }
            }

            setDataLoaded(true);
        } catch (err) {
            console.error('Error loading saved data:', err);
            setDataLoaded(true); // Still mark as loaded to prevent infinite loop
        }
    };

    // Removed auto-save functions - saving only happens in Profile page

    // Get unique university names (grouped by shortName)
    const getUniversityNames = () => {
        const uniqueNames = new Map<string, string>();
        universities.forEach(uni => {
            if (!uniqueNames.has(uni.shortName)) {
                // Extract base name (remove campus info in parentheses)
                const baseName = uni.name.split(' (')[0];
                uniqueNames.set(uni.shortName, baseName);
            }
        });
        return Array.from(uniqueNames.values()).sort();
    };

    // Get campuses for selected university
    const getCampusesForUniversity = (universityBaseName: string) => {
        return universities
            .filter(uni => uni.name.startsWith(universityBaseName))
            .map(uni => ({
                campus: uni.campus,
                fullName: uni.name
            }));
    };

    // Get the full university object based on selections
    const getSelectedUniversityData = () => {
        if (!selectedUniversity) return null;
        
        const campuses = getCampusesForUniversity(selectedUniversity);
        
        // If only one campus, use it automatically
        if (campuses.length === 1) {
            return universities.find(uni => uni.name === campuses[0].fullName);
        }
        
        // If multiple campuses, need campus selection
        if (!selectedCampus) return null;
        
        return universities.find(uni => 
            uni.name.startsWith(selectedUniversity) && uni.campus === selectedCampus
        );
    };

    // Handle university selection
    const handleUniversityChange = (uniName: string) => {
        setSelectedUniversity(uniName);
        setSelectedCampus(""); // Reset campus when university changes
        
        // Auto-select if only one campus
        const campuses = getCampusesForUniversity(uniName);
        if (campuses.length === 1) {
            setSelectedCampus(campuses[0].campus);
        }
    };

    // Helper functions for UI Logic
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

    const handleFileChange = async (file: File) => {
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
        setStatus("loading");
        setError(null);

        try {
            let parsedClasses: ParsedClass[];

            // Check if using saved schedule or uploading new file
            if (user && usesSavedSchedule && classes.length > 0) {
                // Using saved schedule - classes are already parsed
                setLoadingStep("Using saved schedule...");
                parsedClasses = classes;
            } else if (uploadedFile) {
                // Uploading new file - need to parse
                setLoadingStep("Parsing schedule with AI...");
                const response = await processSchedule(uploadedFile.base64, uploadedFile.mimeType);

                if (response.success && response.data) {
                    parsedClasses = response.data;
                    setClasses(parsedClasses);
                    
                    // Auto-save schedule for first-time users
                    if (user && !savedScheduleFileName && uploadedFile) {
                        try {
                            await fetch('/api/user/schedule', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    fileName: uploadedFile.name,
                                    parsedClasses: parsedClasses,
                                }),
                            });
                            console.log('✅ Saved initial schedule');
                        } catch (err) {
                            console.error('Error saving initial schedule:', err);
                        }
                    }
                } else {
                    setStatus("error");
                    setError(response.error || "Failed to parse schedule.");
                    setLoadingStep("");
                    return;
                }
            } else {
                setStatus("error");
                setError("Please upload a schedule or use your saved schedule.");
                setLoadingStep("");
                return;
            }

            const university = getSelectedUniversityData();
            if (!university) {
                setStatus("error");
                setError("Selected university not found. Please select a valid campus from the list.");
                setLoadingStep("");
                return;
            }

            const actualDay = resolveAnalysisDay(selectedDay);
            const analysisDate = getDateForAnalysisDay(selectedDay);
            
            console.log('🔍 Debug Info:');
            console.log('Selected Day:', selectedDay);
            console.log('Actual Day (resolved):', actualDay);
            console.log('Total Parsed Classes:', parsedClasses.length);
            console.log('All Classes:', parsedClasses.map(c => ({ name: c.name, days: c.days })));
            
            const dayClasses = filterClassesByDay(parsedClasses, actualDay);
            
            console.log('Filtered Classes for', actualDay, ':', dayClasses.length);
            console.log('Filtered Classes:', dayClasses.map(c => ({ name: c.name, days: c.days })));

            if (dayClasses.length === 0) {
                setStatus("error");
                setError(`No classes found for ${getDayOptions().find(opt => opt.value === selectedDay)?.label || selectedDay}.`);
                setLoadingStep("");
                return;
            }

                setLoadingStep(`Fetching weather data for ${university.shortName}...`);
                let weatherData;
                try {
                    const weatherResponse = await getWeatherForecastAction(university.lat, university.lng, analysisDate);
                    if (!weatherResponse.success || !weatherResponse.data) {
                        throw new Error(weatherResponse.error || "Failed to fetch weather");
                    }
                    weatherData = weatherResponse.data;
                    setFullWeatherData(weatherData); // Store for graph
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
                    setError("No weather data available for the selected date.");
                    setLoadingStep("");
                    return;
                }

                setLoadingStep(`Generating clothing recommendations...`);
                const attireResponse = await generateAttireRecommendationsAction(matches);

                if (attireResponse.success && attireResponse.data) {
                    const attireRecs = attireResponse.data;
                    setClassAttireRecommendations(attireRecs);

                    setLoadingStep("Finalizing outfit strategy...");
                    const masterResponse = await generateMasterRecommendationAction(attireRecs);

                    let masterRec = null;
                    if (masterResponse.success && masterResponse.data) {
                        masterRec = masterResponse.data;
                        setMasterRecommendation(masterRec);
                    }

                    // Save analysis results to sessionStorage using local variables
                    const analysisResults = {
                        classWeatherMatches: matches,
                        classAttireRecommendations: attireRecs,
                        masterRecommendation: masterRec,
                        fullWeatherData: weatherData,
                        selectedDay,
                        universityName: university.shortName,
                    };
                    sessionStorage.setItem('analysisResults', JSON.stringify(analysisResults));

                    setStatus("success");
                    setLoadingStep("");

                    // Redirect to analysis page
                    router.push('/analysis');
                } else {
                    setStatus("error");
                    setError("Failed to generate recommendations. Please try again.");
                    setLoadingStep("");
                    return;
                }
        } catch (err) {
            console.error("Analysis error:", err);
            setStatus("error");
            setError("Error during analysis. Please try again.");
            setLoadingStep("");
        }
    };

    // Helper to determine background weather animation
    const getBackgroundCondition = (): "clear" | "clouds" | "rain" | "snow" => {
        if (!classWeatherMatches || classWeatherMatches.length === 0) return "clear";

        const conditions = classWeatherMatches
            .map(m => m.weather?.condition.toLowerCase() || "")
            .filter(c => c !== "");

        // Priority: Snow > Rain > Clouds > Clear
        if (conditions.some(c => c.includes("snow"))) return "snow";
        if (conditions.some(c => c.includes("rain") || c.includes("drizzle") || c.includes("thunder"))) return "rain";
        if (conditions.some(c => c.includes("cloud") || c.includes("overcast"))) return "clouds";

        return "clear";
    };

    const backgroundCondition = getBackgroundCondition();

    return (
        <main className="min-h-screen text-white relative">
            <PremiumBackground weatherCondition={backgroundCondition} />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/40">
                        Stratus
                    </h1>
                    <p className="text-lg text-white/60">
                        AI-Powered Weather & Attire Intelligence
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {status !== "success" ? (
                        <motion.div
                            key="input-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            className="space-y-6"
                        >
                            {/* Info boxes for logged-in users */}
                            {user && !savedScheduleFileName && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                                >
                                    <p className="text-sm text-green-200">
                                        👋 <strong>Welcome!</strong> Your selections will be automatically saved as your preferences. 
                                        You can edit them anytime in your <a href="/profile" className="underline hover:text-green-100 font-semibold">Profile</a>.
                                    </p>
                                </motion.div>
                            )}
                            
                            {user && savedScheduleFileName && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                >
                                    <p className="text-sm text-blue-200">
                                        💡 <strong>Quick Analysis:</strong> Changes here are temporary and won't affect your saved preferences. 
                                        To update your default settings, visit your <a href="/profile" className="underline hover:text-blue-100">Profile</a>.
                                    </p>
                                </motion.div>
                            )}

                            {/* Campus Selection */}
                            <GlassCard delay={0.1}>
                                <div className="flex items-center gap-3 mb-4">
                                    <MapPin className="text-primary w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Select Your Campus</h2>
                                </div>
                                <div className="space-y-4">
                                {/* University Selection */}
                                <div className="relative">
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => handleUniversityChange(e.target.value)}
                                        disabled={status === "loading"}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="" className="bg-gray-900">Select a university...</option>
                                        {getUniversityNames().map((uniName) => (
                                            <option key={uniName} value={uniName} className="bg-gray-900">
                                                {uniName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Campus Selection (only if multiple campuses) */}
                                {selectedUniversity && getCampusesForUniversity(selectedUniversity).length > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="relative"
                                    >
                                        <select
                                            value={selectedCampus}
                                            onChange={(e) => setSelectedCampus(e.target.value)}
                                            disabled={status === "loading"}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="" className="bg-gray-900">Select a campus...</option>
                                            {getCampusesForUniversity(selectedUniversity).map((campus) => (
                                                <option key={campus.campus} value={campus.campus} className="bg-gray-900">
                                                    {campus.campus}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            </GlassCard>

                            {/* Date Selection */}
                            <GlassCard delay={0.2}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="text-primary w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Select Analysis Day</h2>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        disabled={status === "loading"}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                    >
                                        {getDayOptions().map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Schedule Selection */}
                            <GlassCard delay={0.3}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Cloud className="text-primary w-5 h-5" />
                                    <h2 className="text-xl font-semibold">Schedule</h2>
                                </div>

                                {user && savedScheduleFileName ? (
                                    // Logged in with saved schedule
                                    <div className="space-y-4">
                                        {/* Toggle between saved and upload */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setUsesSavedSchedule(true)}
                                                disabled={status === "loading"}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                                                    usesSavedSchedule
                                                        ? "bg-primary text-white"
                                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                Use Saved Schedule
                                            </button>
                                            <button
                                                onClick={() => setUsesSavedSchedule(false)}
                                                disabled={status === "loading"}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                                                    !usesSavedSchedule
                                                        ? "bg-primary text-white"
                                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                Upload New
                                            </button>
                                        </div>

                                        {usesSavedSchedule ? (
                                            // Show saved schedule info
                                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-white/60 mb-1">Your Saved Schedule</p>
                                                        <p className="font-medium text-lg">
                                                            {classes.length} {classes.length === 1 ? 'Class' : 'Classes'} Loaded
                                                        </p>
                                                        <p className="text-xs text-white/40 mt-1">
                                                            Ready to analyze
                                                        </p>
                                                    </div>
                                                    <a
                                                        href="/profile"
                                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
                                                    >
                                                        Edit Schedule
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            // Show upload option
                                            <FileUpload
                                                onFileSelect={handleFileChange}
                                                uploadedFileName={!usesSavedSchedule ? uploadedFile?.name : undefined}
                                                disabled={status === "loading" || !getSelectedUniversityData()}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    // Not logged in or no saved schedule - show upload only
                                    <>
                                        <FileUpload
                                            onFileSelect={handleFileChange}
                                            uploadedFileName={uploadedFile?.name}
                                            disabled={status === "loading" || !getSelectedUniversityData()}
                                        />
                                        {!getSelectedUniversityData() && (
                                            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> Please select a campus first
                                            </p>
                                        )}
                                    </>
                                )}
                            </GlassCard>

                            {/* Analyze Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="pt-4"
                            >
                                <AnimatedButton
                                    onClick={handleAnalyze}
                                    disabled={
                                        status === "loading" || 
                                        !getSelectedUniversityData() || 
                                        (!uploadedFile && !(user && usesSavedSchedule && classes.length > 0))
                                    }
                                    className="w-full text-lg py-4 shadow-2xl"
                                >
                                    {status === "loading" ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {loadingStep || "Analyzing..."}
                                        </span>
                                    ) : (
                                        "🚀 Analyze Schedule"
                                    )}
                                </AnimatedButton>
                            </motion.div>

                            {/* Error Message */}
                            {status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Analysis Failed</p>
                                        <p className="text-sm opacity-80">{error}</p>
                                        <button
                                            onClick={() => setStatus("idle")}
                                            className="mt-2 text-xs uppercase tracking-wider font-bold hover:text-white transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Actions Header */}
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                                <div>
                                    <h2 className="text-2xl font-bold">{getSelectedUniversityData()?.name || "Unknown Campus"}</h2>
                                    <p className="text-white/50 text-sm">
                                        {getDayOptions().find(opt => opt.value === selectedDay)?.label}
                                    </p>
                                </div>
                                <AnimatedButton variant="secondary" onClick={() => setStatus("idle")} className="py-2 px-4 text-sm">
                                    New Search
                                </AnimatedButton>
                            </div>

                            {/* Master Strategy Card */}
                            {masterRecommendation && (
                                <GlassCard className="border-l-4 border-l-primary bg-gradient-to-br from-primary/10 to-purple-500/5">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="text-primary w-6 h-6" />
                                        <h3 className="text-xl font-bold uppercase tracking-wider">AI Master Strategy</h3>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-xs text-white/40 font-mono">CONDITION</p>
                                            <p className="text-lg font-semibold">{masterRecommendation.weatherRange.conditions[0]}</p>
                                            <p className="text-sm text-white/60">
                                                {masterRecommendation.weatherRange.minTemp}° - {masterRecommendation.weatherRange.maxTemp}°C
                                            </p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-xs text-white/40 font-mono">STRATEGY</p>
                                            <p className="text-lg leading-relaxed">{masterRecommendation.baseOutfit}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                                        <p className="text-sm italic text-white/80">
                                            "{masterRecommendation.reasoning}"
                                        </p>
                                    </div>

                                    {masterRecommendation.essentialAccessories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {masterRecommendation.essentialAccessories.map((acc, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                                                    + {acc}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </GlassCard>
                            )}

                            {/* Weather Timeline */}
                            <GlassCard>
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Cloud className="w-5 h-5 text-white/60" /> Weather Timeline
                                </h3>
                                <WeatherSummary matches={classWeatherMatches} fullWeatherData={fullWeatherData} />
                            </GlassCard>

                            {/* Class Recommendations */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white/60 px-2">Class-by-Class Breakdown</h3>
                                {classAttireRecommendations.map((rec, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <GlassCard
                                            className={`transition-all duration-300 ${collapsedClasses.has(idx) ? 'bg-white/5' : 'bg-white/10'}`}
                                            hover={false}
                                        >
                                            <div
                                                onClick={() => toggleClass(idx)}
                                                className="cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-12 rounded-full ${rec.attire.priority === 'essential' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`} />
                                                    <div>
                                                        <h4 className="text-lg font-bold">{rec.class.name}</h4>
                                                        <p className="text-sm text-white/50 font-mono">
                                                            {rec.class.startTime} • {rec.class.location || "On Campus"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {collapsedClasses.has(idx) ? <ChevronDown className="text-white/40" /> : <ChevronUp className="text-white/40" />}
                                            </div>

                                            <AnimatePresence>
                                                {!collapsedClasses.has(idx) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-6 pl-6 grid md:grid-cols-2 gap-8 border-t border-white/10 mt-6">
                                                            {rec.weather && (
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                                                                        <Thermometer className="w-4 h-4" /> CONDITIONS
                                                                    </div>
                                                                    <div className="text-2xl font-bold">
                                                                        {rec.weather.temp}°C
                                                                        <span className="text-sm font-normal text-white/50 ml-2">Feels like {rec.weather.feelsLike}°</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                                                                        <div className="flex items-center gap-2"><Wind className="w-3 h-3" /> {rec.weather.windSpeed} km/h</div>
                                                                        <div className="flex items-center gap-2"><Droplets className="w-3 h-3" /> {rec.weather.humidity}%</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                                                                    <Shirt className="w-4 h-4" /> RECOMMENDATION
                                                                </div>
                                                                <p className="leading-relaxed font-medium text-blue-200">
                                                                    {rec.attire.recommendation}
                                                                </p>
                                                                <p className="text-sm text-white/50 italic">
                                                                    "{rec.attire.reasoning}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                <footer className="mt-20 pt-8 border-t border-white/10 text-center text-white/30 text-xs font-mono">
                    <p>STRATUS INTELLIGENCE ENGINE v1.0 • POWERED BY GEMINI</p>
                </footer>
            </div>
        </main>
    );
}
