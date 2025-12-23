"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function WeatherAnimation() {
    const [isRaining, setIsRaining] = useState(true);
    const [raindrops, setRaindrops] = useState<Array<{ id: number; left: number; delay: number }>>([]);

    // Cycle between rain and sun every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsRaining((prev) => !prev);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Generate raindrops
    useEffect(() => {
        if (isRaining) {
            const drops = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
            }));
            setRaindrops(drops);
        } else {
            setRaindrops([]);
        }
    }, [isRaining]);

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            <AnimatePresence>
                {isRaining && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0"
                    >
                        {raindrops.map((drop) => (
                            <motion.div
                                key={drop.id}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{
                                    y: "100vh",
                                    opacity: [0, 0.6, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: drop.delay,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    position: "absolute",
                                    left: `${drop.left}%`,
                                    width: "1px",
                                    height: "20px",
                                    background: "linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5), transparent)",
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Weather indicator (subtle) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="absolute top-4 right-4 text-xs text-white/40 font-mono"
            >
                {isRaining ? "🌧️ Rainy" : "☀️ Sunny"}
            </motion.div>
        </div>
    );
}
