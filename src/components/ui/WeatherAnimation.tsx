"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface WeatherAnimationProps {
    condition: "clear" | "clouds" | "rain" | "snow";
}

export default function WeatherAnimation({ condition }: WeatherAnimationProps) {
    const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

    // Generate particles based on condition
    useEffect(() => {
        const particleCount = condition === "rain" ? 50 : condition === "snow" ? 30 : 0;

        if (particleCount > 0) {
            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * (condition === "snow" ? 5 : 2),
                duration: condition === "snow" ? Math.random() * 5 + 5 : 1.5, // Snow moves slower
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [condition]);

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            <AnimatePresence mode="wait">
                {condition === "rain" && (
                    <motion.div
                        key="rain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        {particles.map((drop) => (
                            <motion.div
                                key={drop.id}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{
                                    y: "100vh",
                                    opacity: [0, 0.6, 0],
                                }}
                                transition={{
                                    duration: drop.duration,
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

                {condition === "snow" && (
                    <motion.div
                        key="snow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0"
                    >
                        {particles.map((flake) => (
                            <motion.div
                                key={flake.id}
                                initial={{ y: -10, opacity: 0, x: 0 }}
                                animate={{
                                    y: "100vh",
                                    opacity: [0, 0.8, 0],
                                    x: [0, Math.random() * 20 - 10, 0], // Slight horizontal drift
                                }}
                                transition={{
                                    duration: flake.duration,
                                    delay: flake.delay,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    position: "absolute",
                                    left: `${flake.left}%`,
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "rgba(255, 255, 255, 0.8)",
                                    boxShadow: "0 0 5px rgba(255,255,255,0.5)",
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
