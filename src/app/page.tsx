"use client";

import { useState } from "react";
import { ScheduleUpload } from "@/components/upload/schedule-upload";
import { ValidationForm } from "@/components/upload/validation-form";
import { SkeletonCards } from "@/components/ui/skeleton-cards";
import { Sparkles } from "lucide-react";
import { Class, Day, CommuteMethod } from "@/types";
import Link from "next/link";
import { OnboardingForm } from "@/components/upload/onboarding-form";
import { onboardUser, saveSchedule } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Mock Data for demonstration
const MOCK_CLASSES: Class[] = [
    {
        id: "1",
        name: "Advanced Computer Science",
        startTime: "09:00 AM",
        endTime: "10:30 AM",
        location: "Hall A - Room 302",
        days: [Day.MONDAY, Day.WEDNESDAY],
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "2",
        name: "Environmental Science",
        startTime: "11:00 AM",
        endTime: "12:30 PM",
        location: "Green Lab - Bld 4",
        days: [Day.TUESDAY, Day.THURSDAY],
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export default function Home() {
    const [view, setView] = useState<"upload" | "loading" | "validation" | "onboarding" | "dashboard">("upload");
    const [parsedClasses, setParsedClasses] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleUploadFinish = (classes: any[]) => {
        setParsedClasses(classes);
        setView("validation");
    };

    const handleOnboardingComplete = async (userData: {
        email: string;
        name: string;
        campusLocation: string;
        homeLocation: string;
        commuteMethod: CommuteMethod;
    }) => {
        setIsSaving(true);
        try {
            // 1. Onboard user
            const user = await onboardUser(userData);
            
            // 2. Save classes
            await saveSchedule(user.id, parsedClasses);
            
            // 3. Save email to localStorage for persistence (simple alternative to auth)
            localStorage.setItem("userEmail", userData.email);
            
            setView("dashboard");
        } catch (error) {
            console.error("Saving Error:", error);
            alert("Failed to save your schedule. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 pt-20 pb-32">
            {view === "upload" && (
                <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in duration-700">
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-border bg-white/5 backdrop-blur-md text-primary text-xs font-semibold tracking-wider uppercase">
                            <Sparkles className="w-3 h-3" />
                            AI-Powered Commute Assistant
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            Elevate Your Daily <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400 text-glow">
                                Commute Experience
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Stratus parses your student schedule and cross-references it with real-time weather
                            to recommend the perfect outfit, essential tools, and the safest vehicle for your day.
                        </p>
                    </div>

                    <ScheduleUpload onParsed={handleUploadFinish} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-12">
                        {[
                            {
                                title: "Smart Clothing",
                                desc: "From breathable linen to heavy parkas, we know what fits the hourly forecast.",
                                icon: "👕"
                            },
                            {
                                title: "Safety First",
                                desc: "Walking, biking, or driving? We suggest the safest method based on road conditions.",
                                icon: "🚗"
                            },
                            {
                                title: "Gear Up",
                                desc: "Never forget an umbrella or a power bank again. We've got your back.",
                                icon: "🎒"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-3xl glass transition-all hover:translate-y-[-4px] group">
                                <div className="text-3xl mb-4 group-hover:scale-120 transition-transform duration-300 inline-block">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === "loading" && (
                <div className="space-y-8">
                    <div className="text-center space-y-4 max-w-xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold animate-pulse text-primary">Gemini is parsing...</h2>
                        <p className="text-muted-foreground">Extracting classes, times, and locations from your schedule.</p>
                    </div>
                    <SkeletonCards />
                </div>
            )}

            {view === "validation" && (
                <ValidationForm
                    initialClasses={parsedClasses}
                    onConfirm={(updated) => {
                        setParsedClasses(updated);
                        setView("onboarding");
                    }}
                />
            )}

            {view === "onboarding" && (
                isSaving ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-xl font-medium">Syncing your data with the stars...</p>
                    </div>
                ) : (
                    <OnboardingForm onComplete={handleOnboardingComplete} />
                )
            )}

            {view === "dashboard" && (
                <div className="text-center space-y-8 py-20 animate-in fade-in zoom-in duration-1000">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-6 border border-emerald-500/30">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black">Schedule Configured!</h2>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        Your personalized dashboard is ready. <br />
                        We've synced your classes with real-time weather forecasts.
                    </p>
                    <div className="flex flex-col items-center gap-4 pt-8">
                        <Link
                            href="/dashboard"
                            onClick={(e) => {
                                e.preventDefault();
                                const email = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
                                router.push(`/dashboard${email ? `?email=${email}` : ""}`);
                            }}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all"
                        >
                            Enter Live Dashboard
                        </Link>
                        <button
                            onClick={() => setView("upload")}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
