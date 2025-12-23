"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}

export default function GlassCard({ children, className = "", delay = 0, hover = true }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`glass-morphism rounded-2xl p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
}
