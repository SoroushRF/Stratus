"use client";

import { Recommendation } from "@/types";
import { motion } from "framer-motion";
import { Shirt, Footprints, CheckCircle2, Sparkles, Briefcase } from "lucide-react";

interface RecommendationHeroProps {
    recommendation: Recommendation;
    summary: string;
}

export function RecommendationHero({ recommendation, summary }: RecommendationHeroProps) {
    const { clothingPlan, tools, advice } = recommendation;

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
                    <Sparkles className="w-24 h-24 text-primary" />
                </div>

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        AI-Synthesized Plan
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black leading-tight italic">
                        &quot;{summary}&quot;
                    </h2>
                    <p className="text-muted-foreground">{advice}</p>
                </div>
            </motion.div>

            {/* Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Attire Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Shirt className="w-7 h-7" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">Your Wardrobe</h3>
                        <div className="space-y-2">
                           <div className="flex flex-col">
                             <span className="text-xs text-muted-foreground uppercase font-bold">Outerwear</span>
                             <span className="text-lg font-bold">{clothingPlan.outerwear}</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-xs text-muted-foreground uppercase font-bold">Top/Bottom</span>
                             <span className="text-lg font-bold">{clothingPlan.top}, {clothingPlan.bottom}</span>
                           </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footwear Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                        <Footprints className="w-7 h-7" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">Footwear</h3>
                        <div className="space-y-3">
                            <div className="text-xl font-bold text-white">{clothingPlan.footwear}</div>
                            <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-muted-foreground leading-relaxed italic">
                                &quot;{clothingPlan.rationale}&quot;
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Accessories Card */}
                <motion.div variants={itemVariants} className="glass p-8 rounded-3xl space-y-6 group hover:border-white/20 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-400">Accessories</h3>
                        <ul className="space-y-2">
                            {tools.map((item, i) => (
                                <li key={i} className="text-xl font-bold flex items-center gap-2 text-zinc-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
