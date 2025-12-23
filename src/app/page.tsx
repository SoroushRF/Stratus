"use client";

import { useState } from "react";
import { ScheduleUpload } from "@/components/upload/schedule-upload";
import { ValidationForm } from "@/components/upload/validation-form";
import { SkeletonCards } from "@/components/ui/skeleton-cards";
import { Sparkles } from "lucide-react";
import { Class, Day } from "@/types";
import Link from "next/link";
import { OnboardingForm } from "@/components/upload/onboarding-form";
import { onboardUser, saveSchedule } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

// Main Component
export default function Home() {
    const [view, setView] = useState<"upload" | "loading" | "validation" | "onboarding" | "dashboard">("upload");
    const [parsedClasses, setParsedClasses] = useState<Omit<Class, "id" | "userId" | "createdAt" | "updatedAt">[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleUploadFinish = (classes: Omit<Class, "id" | "userId" | "createdAt" | "updatedAt">[]) => {
        setParsedClasses(classes);
        setView("validation");
    };

    const handleOnboardingComplete = async (userData: {
        email: string;
        name: string;
        campusLocation: string;
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

    const steps = [
        { id: "upload", label: "Upload" },
        { id: "validation", label: "Verify" },
        { id: "onboarding", label: "Sync" },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === view);

    return (
        <div className="container mx-auto px-4 pt-12 pb-32">
            {/* Step Indicator */}
            {view !== "dashboard" && view !== "loading" && (
                <div className="max-w-md mx-auto mb-20 flex justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 -z-10" />
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background/50 backdrop-blur-sm px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                                i <= currentStepIndex ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]" : "bg-zinc-900 border-white/10 text-muted-foreground"
                            }`}>
                                {i + 1}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${i <= currentStepIndex ? "text-primary" : "text-muted-foreground"}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {view === "upload" && (
                <div className="flex flex-col items-center text-center space-y-16 animate-in fade-in duration-1000">
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-border bg-primary/5 backdrop-blur-md text-primary text-xs font-bold tracking-widest uppercase">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI-Powered Attire Sync
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] pb-2">
                            Master Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-indigo-400 text-glow">
                                Campus Day
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Stratus bridges the gap between your schedule and the sky. 
                            Get hourly wardrobe blueprints tailored to every class.
                        </p>
                    </div>

                    <div className="w-full transform transition-all duration-700 hover:scale-[1.01]">
                      <ScheduleUpload onParsed={handleUploadFinish} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pt-12">
                        {[
                            {
                                title: "Smart Wardrobe",
                                desc: "Dynamic layering suggestions for the walk between and inside campus halls.",
                                icon: "👕"
                            },
                            {
                                title: "Hourly Precision",
                                desc: "Synced directly with your class start times for the most accurate forecast.",
                                icon: "☁️"
                            },
                            {
                                title: "Campus Tools",
                                desc: "Essential gear reminders. Never get caught without that crucial umbrella.",
                                icon: "🎒"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-[32px] glass-dark border border-white/5 transition-all hover:bg-white/5 group">
                                <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-500 inline-block">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === "loading" && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-10">
                    <div className="relative">
                        <Loader2 className="w-20 h-20 text-primary animate-spin" />
                        <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center space-y-4 max-w-xl mx-auto">
                        <h2 className="text-4xl font-black animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Gemini is Synthesizing...</h2>
                        <p className="text-lg text-muted-foreground font-medium">Extracting your temporal blueprint from the uploaded schedule.</p>
                    </div>
                </div>
            )}

            {view === "validation" && (
                <div className="animate-in fade-in zoom-in-95 duration-700">
                    <ValidationForm
                        initialClasses={parsedClasses}
                        onConfirm={(updated) => {
                            setParsedClasses(updated);
                            setView("onboarding");
                        }}
                    />
                </div>
            )}

            {view === "onboarding" && (
                isSaving ? (
                    <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in fade-in duration-500">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <div className="text-center space-y-2">
                          <p className="text-3xl font-black">Syncing the Stars...</p>
                          <p className="text-muted-foreground font-medium text-lg">Aligning your schedule with global weather satellites.</p>
                        </div>
                    </div>
                ) : (
                    <OnboardingForm onComplete={handleOnboardingComplete} />
                )
            )}

            {view === "dashboard" && (
                <div className="text-center space-y-12 py-12 animate-in fade-in zoom-in-90 duration-1000">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-emerald-500/20 rounded-[40px] flex items-center justify-center mx-auto text-emerald-400 mb-6 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <Sparkles className="w-16 h-16" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-background p-1.5 rounded-full shadow-lg">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-5xl md:text-7xl font-black tracking-tight italic">Sync Complete.</h2>
                      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
                          Your profile is locked in. <br />
                          Prepare for a perfectly coordinated campus day.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-10">
                        <Link
                            href="/dashboard"
                            onClick={(e) => {
                                e.preventDefault();
                                const email = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
                                router.push(`/dashboard${email ? `?email=${email}` : ""}`);
                            }}
                            className="px-12 py-6 bg-primary text-white rounded-[26px] text-xl font-black shadow-[0_20px_50px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                        >
                            Enter Live Lab
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => setView("upload")}
                            className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors py-2 border-b border-transparent hover:border-primary/30"
                        >
                            Start New Sync
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
