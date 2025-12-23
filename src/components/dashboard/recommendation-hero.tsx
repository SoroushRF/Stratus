"use client";

import { Recommendation } from "@/types";
import { motion } from "framer-motion";
import { Shirt, Briefcase, Car, AlertTriangle, CheckCircle2, Info, Footprints, Bike, Bus } from "lucide-react";

interface RecommendationHeroProps {
    recommendation: Recommendation;
    summary: string;
}

export function RecommendationHero({ recommendation, summary }: RecommendationHeroProps) {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    const getCommuteIcon = (method: string) => {
        const m = method.toUpperCase();
        if (m === "DRIVING") return <Car className="w-6 h-6" />;
        if (m === "WALKING") return <Footprints className="w-6 h-6" />;
        if (m === "BIKING") return <Bike className="w-6 h-6" />;
        if (m === "TRANSIT") return <Bus className="w-6 h-6" />;
        return <Info className="w-6 h-6" />;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-5xl mx-auto space-y-8"
        >
            {/* Main Advice Summary */}
            <motion.div
                variants={itemVariants}
                className="glass p-8 md:p-12 rounded-[40px] border border-primary/20 bg-primary/5 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle2 className="w-24 h-24 text-primary" />
                </div>

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Optimized for you
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black leading-tight italic">
                        "{summary}"
                    </h2>
                    <p className="text-muted-foreground">Based on your classes today and the shifting weather conditions.</p>
                </div>
            </motion.div>

            {/* Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clothing Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Shirt className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">What to wear</h3>
                        <ul className="space-y-2">
                            {recommendation.clothing.map((item, i) => (
                                <li key={i} className="text-xl font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Tools Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">Daily Gear</h3>
                        <ul className="space-y-2">
                            {recommendation.tools.map((item, i) => (
                                <li key={i} className="text-xl font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Commute Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                        {getCommuteIcon(recommendation.commuteMethod)}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">Safety Policy</h3>
                        <div className="space-y-3">
                            <div className="text-2xl font-black text-white">{recommendation.commuteMethod}</div>
                            <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-muted-foreground leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{recommendation.commuteAdvice}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
