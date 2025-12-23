"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardTimeline } from "@/components/dashboard/dashboard-timeline";
import { RecommendationHero } from "@/components/dashboard/recommendation-hero";
import { Sparkles, Calendar, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/app/actions";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : null) || "test@example.com";

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getDashboardData(email);
                setData(result);
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [email]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Synchronizing your schedule with the latest weather...</p>
            </div>
        );
    }

    if (!data || !data.classSchedules || data.classSchedules.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center px-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">No Classes Scheduled Today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</h2>
                    <p className="text-muted-foreground">Enjoy your day off! Check back tomorrow for your next sync.</p>
                </div>
                <Link href="/" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Upload
                </Link>
            </div>
        );
    }

    // Use the first class's recommendation as the hero summary (simplification)
    const primaryRecommendation = data.classSchedules[0].recommendation;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto px-4 py-12 space-y-16"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div className="space-y-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Upload
                    </Link>
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            Live Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black">Your Daily Sync</h1>
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{data.user.campusLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl glass-border">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Today's Peak</p>
                        <p className="text-xl font-black">{Math.max(...data.classSchedules.map((s: any) => s.weather.temp))}°C</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Commute Safety</p>
                        <p className="text-xl font-black text-emerald-400 font-mono tracking-tighter">SECURE</p>
                    </div>
                </div>
            </motion.div>

            {/* Recommendation Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">AI Recommendations</h2>
                </div>
                <RecommendationHero 
                    recommendation={{
                        clothing: [primaryRecommendation.clothingRecommendation],
                        tools: ["Umbrella (if precip > 40%)", "Water Bottle", "Campus Gear"],
                        commuteMethod: primaryRecommendation.method,
                        commuteAdvice: primaryRecommendation.warning || "Your commute looks clear and safe today."
                    }} 
                    summary={`Expected travel time: ${primaryRecommendation.estimatedTime} mins via ${primaryRecommendation.method.toLowerCase()}.`} 
                />
            </section>

            {/* Timeline Section */}
            <section className="space-y-8 pb-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Schedule Timeline</h2>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
                        {data.classSchedules.length} Classes Today
                    </div>
                </div>

                <DashboardTimeline 
                    schedule={data.classSchedules.map((s: any) => ({
                        cls: s,
                        weather: {
                            time: s.startTime,
                            temp: s.weather.temp,
                            condition: s.weather.condition,
                            icon: s.weather.icon,
                            description: `${s.weather.condition} at ${s.startTime}`
                        }
                    }))} 
                />
            </section>
        </motion.div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
