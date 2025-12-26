'use client';

import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({ 
  title = "Stratus", 
  subtitle = "AI-Powered Weather & Attire Intelligence" 
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/40">
        {title}
      </h1>
      <p className="text-lg text-white/60">
        {subtitle}
      </p>
    </motion.div>
  );
}
