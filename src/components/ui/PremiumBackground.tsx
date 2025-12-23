"use client";

import { motion } from "framer-motion";
import WeatherAnimation from "./WeatherAnimation";

export default function PremiumBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Animated Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-sky-500/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]"
            />

            {/* Sunny Golden Orb - Repositioned to Top Right */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-[10%] -right-[10%] w-[30%] h-[30%] bg-gradient-to-br from-yellow-300/40 via-orange-300/30 to-amber-400/20 rounded-full blur-[100px]"
            />

            {/* Additional sun glow layer for extra shine */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
                className="absolute -top-[2%] right-[0%] w-[18%] h-[18%] bg-yellow-200/30 rounded-full blur-[80px]"
            />

            {/* Noise Texture for atmospheric depth */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

            {/* Dynamic Weather Animation */}
            <WeatherAnimation />
        </div>
    );
}
