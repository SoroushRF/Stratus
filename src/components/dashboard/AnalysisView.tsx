'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sparkles, Droplets, ChevronDown, ChevronUp, Shirt, Wind, Thermometer } from 'lucide-react';
import { ClassAttireRecommendation, MasterRecommendation } from '@/types';
import { ClassWeatherMatch } from '@/lib/utils/weatherMatcher';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import WeatherSummary from '@/components/ui/WeatherSummary';

interface AnalysisViewProps {
  // University/Day info
  universityName: string;
  selectedDayLabel: string;

  // Analysis results
  masterRecommendation: MasterRecommendation | null;
  classWeatherMatches: ClassWeatherMatch[];
  classAttireRecommendations: ClassAttireRecommendation[];
  fullWeatherData: any;

  // Actions
  onNewSearch: () => void;
}

export default function AnalysisView({
  universityName,
  selectedDayLabel,
  masterRecommendation,
  classWeatherMatches,
  classAttireRecommendations,
  fullWeatherData,
  onNewSearch,
}: AnalysisViewProps) {
  const [collapsedClasses, setCollapsedClasses] = useState<Set<number>>(new Set());

  const toggleClass = (idx: number) => {
    const newCollapsed = new Set(collapsedClasses);
    if (newCollapsed.has(idx)) {
      newCollapsed.delete(idx);
    } else {
      newCollapsed.add(idx);
    }
    setCollapsedClasses(newCollapsed);
  };

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Actions Header */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
        <div>
          <h2 className="text-2xl font-bold">{universityName}</h2>
          <p className="text-white/50 text-sm">{selectedDayLabel}</p>
        </div>
        <AnimatedButton variant="secondary" onClick={onNewSearch} className="py-2 px-4 text-sm">
          New Search
        </AnimatedButton>
      </div>

      {/* Master Strategy Card */}
      {masterRecommendation && (
        <GlassCard className="border-l-4 border-l-primary bg-gradient-to-br from-primary/10 to-purple-500/5">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold uppercase tracking-wider">AI Master Strategy</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-mono">CONDITION</p>
              <p className="text-lg font-semibold">{masterRecommendation.weatherRange.conditions[0]}</p>
              <p className="text-sm text-white/60">
                {masterRecommendation.weatherRange.minTemp}° - {masterRecommendation.weatherRange.maxTemp}°C
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-white/40 font-mono">STRATEGY</p>
              <p className="text-lg leading-relaxed">{masterRecommendation.baseOutfit}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <p className="text-sm italic text-white/80">
              "{masterRecommendation.reasoning}"
            </p>
          </div>

          {masterRecommendation.essentialAccessories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {masterRecommendation.essentialAccessories.map((acc, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                  + {acc}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Weather Timeline */}
      <GlassCard>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-white/60" /> Weather Timeline
        </h3>
        <WeatherSummary matches={classWeatherMatches} fullWeatherData={fullWeatherData} />
      </GlassCard>

      {/* Class Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white/60 px-2">Class-by-Class Breakdown</h3>
        {classAttireRecommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard
              className={`transition-all duration-300 ${collapsedClasses.has(idx) ? 'bg-white/5' : 'bg-white/10'}`}
              hover={false}
            >
              <div
                onClick={() => toggleClass(idx)}
                className="cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${rec.attire.priority === 'essential' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`} />
                  <div>
                    <h4 className="text-lg font-bold">{rec.class.name}</h4>
                    <p className="text-sm text-white/50 font-mono">
                      {rec.class.startTime} • {rec.class.location || "On Campus"}
                    </p>
                  </div>
                </div>
                {collapsedClasses.has(idx) ? <ChevronDown className="text-white/40" /> : <ChevronUp className="text-white/40" />}
              </div>

              <AnimatePresence>
                {!collapsedClasses.has(idx) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 pl-6 grid md:grid-cols-2 gap-8 border-t border-white/10 mt-6">
                      {rec.weather && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                            <Thermometer className="w-4 h-4" /> CONDITIONS
                          </div>
                          <div className="text-2xl font-bold">
                            {rec.weather.temp}°C
                            <span className="text-sm font-normal text-white/50 ml-2">Feels like {rec.weather.feelsLike}°</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                            <div className="flex items-center gap-2"><Wind className="w-3 h-3" /> {rec.weather.windSpeed} km/h</div>
                            <div className="flex items-center gap-2"><Droplets className="w-3 h-3" /> {rec.weather.humidity}%</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                          <Shirt className="w-4 h-4" /> RECOMMENDATION
                        </div>
                        <p className="leading-relaxed font-medium text-blue-200">
                          {rec.attire.recommendation}
                        </p>
                        <p className="text-sm text-white/50 italic">
                          "{rec.attire.reasoning}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
