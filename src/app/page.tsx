// Refactored with Task 1.1 & 1.2: State Management + Component Atomization
"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWeatherAnalysis, UploadedFile } from '@/hooks/useWeatherAnalysis';
import { University } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

// UI Components
import PremiumBackground from "@/components/ui/PremiumBackground";
import AnimatedButton from "@/components/ui/AnimatedButton";
import SystemNoticeBanner from "@/components/ui/SystemNoticeBanner";

import dynamic from "next/dynamic";

// Dashboard Components (Task 1.2)
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";

const AnalysisView = dynamic(() => import("@/components/dashboard/AnalysisView"), {
    loading: () => (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDayOptions() {
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
}

function getBackgroundCondition(classWeatherMatches: any[]): "clear" | "clouds" | "rain" | "snow" {
    if (!classWeatherMatches || classWeatherMatches.length === 0) return "clear";

    const conditions = classWeatherMatches
        .map(m => m.weather?.condition.toLowerCase() || "")
        .filter(c => c !== "");

    if (conditions.some(c => c.includes("snow"))) return "snow";
    if (conditions.some(c => c.includes("rain") || c.includes("drizzle") || c.includes("thunder"))) return "rain";
    if (conditions.some(c => c.includes("cloud") || c.includes("overcast"))) return "clouds";

    return "clear";
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Home() {
    // --- Auth ---
    const { user } = useAuth();

    // --- Dashboard Data ---
    const {
        systemNotice,
        noticeLoading,
        dismissNotice,
        universities,
        hasSavedProfile,
        savedUniversity,
        savedCampus,
        savedClasses,
        savedScheduleFileName,
        dataLoaded,
        saveInitialPreferences,
    } = useDashboardData(user?.sub || null);

    // --- Analysis ---
    const {
        status,
        loadingStep,
        error,
        classes,
        setClasses,
        classWeatherMatches,
        classAttireRecommendations,
        masterRecommendation,
        fullWeatherData,
        analyze,
        reset,
    } = useWeatherAnalysis();

    // --- Local UI State ---
    const [selectedUniversity, setSelectedUniversity] = useState<string>("");
    const [selectedCampus, setSelectedCampus] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("today");
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [usesSavedSchedule, setUsesSavedSchedule] = useState(true);

    // --- Sync saved preferences ---
    useEffect(() => {
        if (dataLoaded && savedUniversity) setSelectedUniversity(savedUniversity);
    }, [dataLoaded, savedUniversity]);

    useEffect(() => {
        if (dataLoaded && savedCampus) setSelectedCampus(savedCampus);
    }, [dataLoaded, savedCampus]);

    useEffect(() => {
        if (dataLoaded && savedClasses.length > 0 && classes.length === 0) {
            setClasses(savedClasses);
        }
    }, [dataLoaded, savedClasses, classes.length, setClasses]);

    // --- Auto-save for first-time users ---
    useEffect(() => {
        if (user && !hasSavedProfile && selectedUniversity && selectedCampus && dataLoaded) {
            saveInitialPreferences(selectedUniversity, selectedCampus);
        }
    }, [selectedUniversity, selectedCampus, user, hasSavedProfile, dataLoaded, saveInitialPreferences]);

    // =====================================================
    // UNIVERSITY/CAMPUS LOGIC
    // =====================================================

    const getSelectedUniversityData = (): University | null => {
        if (!selectedUniversity) return null;

        const campuses = universities.filter(uni => uni.name.startsWith(selectedUniversity));

        if (campuses.length === 1) {
            return campuses[0];
        }

        if (!selectedCampus) return null;

        return universities.find(uni =>
            uni.name.startsWith(selectedUniversity) && uni.campus === selectedCampus
        ) || null;
    };

    const handleUniversityChange = (uniName: string) => {
        setSelectedUniversity(uniName);
        setSelectedCampus("");

        const campuses = universities.filter(uni => uni.name.startsWith(uniName));
        if (campuses.length === 1) {
            setSelectedCampus(campuses[0].campus);
        }
    };

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleFileChange = async (file: File) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const mimeType = file.type;
                setUploadedFile({ base64: base64Data, mimeType, name: file.name });
            };
        } catch (err) {
            console.error("Error reading file:", err);
        }
    };

    const handleAnalyze = async () => {
        const university = getSelectedUniversityData();
        if (!university) return;

        await analyze({
            selectedDay,
            university,
            uploadedFile,
            savedClasses: classes.length > 0 ? classes : savedClasses,
            usesSavedSchedule,
            userId: user?.sub || null,
            savedScheduleFileName,
        });
    };

    // =====================================================
    // DERIVED STATE
    // =====================================================

    const backgroundCondition = getBackgroundCondition(classWeatherMatches);
    const canAnalyze = getSelectedUniversityData() && (uploadedFile || (user && usesSavedSchedule && (classes.length > 0 || savedClasses.length > 0)));
    const dayOptions = getDayOptions();
    const selectedDayLabel = dayOptions.find(opt => opt.value === selectedDay)?.label || selectedDay;

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <main className="min-h-screen text-white relative">
            <PremiumBackground weatherCondition={backgroundCondition} />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 max-w-4xl">
                <DashboardHeader />

                {/* System Notice Banner */}
                {!noticeLoading && systemNotice && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <SystemNoticeBanner
                            notice={systemNotice}
                            onDismiss={dismissNotice}
                        />
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {status !== "success" ? (
                        <motion.div
                            key="input-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            className="space-y-6"
                        >
                            <OnboardingWizard
                                user={user}
                                hasSavedProfile={hasSavedProfile}
                                universities={universities}
                                selectedUniversity={selectedUniversity}
                                selectedCampus={selectedCampus}
                                onUniversityChange={handleUniversityChange}
                                onCampusChange={setSelectedCampus}
                                selectedDay={selectedDay}
                                onDayChange={setSelectedDay}
                                dayOptions={dayOptions}
                                uploadedFile={uploadedFile}
                                onFileChange={handleFileChange}
                                savedScheduleFileName={savedScheduleFileName}
                                savedClassesCount={classes.length > 0 ? classes.length : savedClasses.length}
                                usesSavedSchedule={usesSavedSchedule}
                                onToggleSavedSchedule={setUsesSavedSchedule}
                                isLoading={status === "loading"}
                            />

                            {/* Analyze Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="pt-4"
                            >
                                <AnimatedButton
                                    onClick={handleAnalyze}
                                    disabled={status === "loading" || !canAnalyze}
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
                                            onClick={reset}
                                            className="mt-2 text-xs uppercase tracking-wider font-bold hover:text-white transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <AnalysisView
                            universityName={getSelectedUniversityData()?.name || "Unknown Campus"}
                            selectedDayLabel={selectedDayLabel}
                            masterRecommendation={masterRecommendation}
                            classWeatherMatches={classWeatherMatches}
                            classAttireRecommendations={classAttireRecommendations}
                            fullWeatherData={fullWeatherData}
                            onNewSearch={reset}
                        />
                    )}
                </AnimatePresence>

                <footer className="mt-20 pt-8 border-t border-white/10 text-center text-white/30 text-xs font-mono">
                    <p>STRATUS INTELLIGENCE ENGINE v1.0 • POWERED BY GEMINI</p>
                </footer>
            </div>
        </main>
    );
}
