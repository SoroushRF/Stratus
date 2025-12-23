"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    className?: string;
}

export default function AnimatedButton({
    children,
    variant = "primary",
    className = "",
    ...props
}: AnimatedButtonProps) {
    const variants = {
        primary: "bg-primary text-white shadow-[0_0_20px_rgba(0,183,255,0.3)] hover:shadow-[0_0_30px_rgba(0,183,255,0.5)]",
        secondary: "bg-white/10 text-white hover:bg-white/20",
        outline: "border border-white/20 text-white hover:bg-white/10",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
