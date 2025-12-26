"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Info, AlertTriangle, Wrench } from "lucide-react";
import { useState } from "react";

interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical" | "maintenance";
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface SystemNoticeBannerProps {
  notice: SystemNotice;
  onDismiss?: () => void;
}

export default function SystemNoticeBanner({ notice, onDismiss }: SystemNoticeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Style configuration based on notice type
  const typeConfig = {
    info: {
      icon: Info,
      bgGradient: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      textColor: "text-blue-100",
      glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    },
    warning: {
      icon: AlertTriangle,
      bgGradient: "from-yellow-500/20 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      iconColor: "text-yellow-400",
      textColor: "text-yellow-100",
      glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    },
    critical: {
      icon: AlertCircle,
      bgGradient: "from-red-500/20 to-red-600/10",
      borderColor: "border-red-500/30",
      iconColor: "text-red-400",
      textColor: "text-red-100",
      glowColor: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    },
    maintenance: {
      icon: Wrench,
      bgGradient: "from-orange-500/20 to-orange-600/10",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
      textColor: "text-orange-100",
      glowColor: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    },
  };

  const config = typeConfig[notice.type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            relative overflow-hidden rounded-2xl border backdrop-blur-xl
            bg-gradient-to-r ${config.bgGradient} ${config.borderColor} ${config.glowColor}
            p-4 md:p-5
          `}
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className={`shrink-0 ${config.iconColor}`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg md:text-xl mb-1 ${config.textColor}`}>
                {notice.title}
              </h3>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {notice.message}
              </p>
              {notice.expires_at && (
                <p className="text-xs text-white/40 mt-2 font-mono">
                  Expires: {new Date(notice.expires_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors group"
              aria-label="Dismiss notice"
            >
              <X className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
