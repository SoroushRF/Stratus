"use client";

import { DashboardTimeline } from "@/components/dashboard/dashboard-timeline";
import { RecommendationHero } from "@/components/dashboard/recommendation-hero";
import { Sparkles, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Class, WeatherForecast, Recommendation, Day } from "@/types";
import { motion } from "framer-motion";

// Mock Data for Phase 4
const MOCK_RECOMMENDATION: Recommendation = {
    clothing: ["Thermal Base Layer", "Windbreaker Jacket", "Comfortable Sneakers"],
    tools: ["Sturdy Umbrella", "Power Bank", "Campus Map"],
    commuteMethod: "Driving",
    commuteAdvice: "Heavy rain starting at 2 PM. Avoid biking or walking long distances to ensure you stay dry for your afternoon labs."
};

const MOCK_SUMMARY = "Expect a mild morning followed by afternoon showers. We recommend driving today to stay dry for your Business Ethics class.";

const MOCK_TIMELINE: Array<{ cls: Class; weather: WeatherForecast }> = [
    {
        cls: {
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
        weather: {
            time: "09:00 AM",
            temp: 18,
            condition: "Clear",
            icon: "sun",
            description: "Sunny with light breeze"
        }
    },
    {
        cls: {
            id: "2",
            name: "Environmental Science",
            startTime: "11:00 AM",
            endTime: "12:30 PM",
            location: "Green Lab - Bld 4",
            days: [Day.TUESDAY, Day.THURSDAY],
            userId: "user-1",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        weather: {
            time: "11:00 AM",
            temp: 20,
            condition: "Partly Cloudy",
            icon: "cloud",
            description: "Passing clouds"
        }
    },
    {
        cls: {
            id: "3",
            name: "Business Ethics",
            startTime: "02:00 PM",
            endTime: "03:30 PM",
            location: "Global Tower - Room 501",
            days: [Day.MONDAY, Day.WEDNESDAY],
            userId: "user-1",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        weather: {
            time: "02:00 PM",
            temp: 16,
            condition: "Rain",
            icon: "cloud-rain",
            description: "Light showers expected"
        }
    }
];

export default function DashboardPage() {
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
                                <span>Monday, Dec 23</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>University Campus</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl glass-border">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Today's Peak</p>
                        <p className="text-xl font-black">22°C</p>
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
                <RecommendationHero recommendation={MOCK_RECOMMENDATION} summary={MOCK_SUMMARY} />
            </section>

            {/* Timeline Section */}
            <section className="space-y-8 pb-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Schedule Timeline</h2>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
                        {MOCK_TIMELINE.length} Classes Today
                    </div>
                </div>

                <DashboardTimeline schedule={MOCK_TIMELINE} />
            </section>
        </motion.div>
    );
}
