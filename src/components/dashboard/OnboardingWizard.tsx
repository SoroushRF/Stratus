'use client';

import { motion } from 'framer-motion';
import { Sparkles, LogIn, MapPin, Calendar, Cloud, ChevronDown } from 'lucide-react';
import { University } from '@/types';
import { UploadedFile } from '@/hooks/useWeatherAnalysis';
import GlassCard from '@/components/ui/GlassCard';
import FileUpload from '@/components/ui/FileUpload';

interface OnboardingWizardProps {
  // User state
  user: any;
  hasSavedProfile: boolean;

  // University/Campus selection
  universities: University[];
  selectedUniversity: string;
  selectedCampus: string;
  onUniversityChange: (university: string) => void;
  onCampusChange: (campus: string) => void;

  // Day selection
  selectedDay: string;
  onDayChange: (day: string) => void;
  dayOptions: { value: string; label: string }[];

  // Schedule upload
  uploadedFile: UploadedFile | null;
  onFileChange: (file: File) => void;
  savedScheduleFileName: string | null;
  savedClassesCount: number;
  usesSavedSchedule: boolean;
  onToggleSavedSchedule: (useSaved: boolean) => void;

  // Loading state
  isLoading: boolean;
}

export default function OnboardingWizard({
  user,
  hasSavedProfile,
  universities,
  selectedUniversity,
  selectedCampus,
  onUniversityChange,
  onCampusChange,
  selectedDay,
  onDayChange,
  dayOptions,
  uploadedFile,
  onFileChange,
  savedScheduleFileName,
  savedClassesCount,
  usesSavedSchedule,
  onToggleSavedSchedule,
  isLoading,
}: OnboardingWizardProps) {
  // Helper functions
  const getUniversityNames = () => {
    const uniqueNames = new Map<string, string>();
    universities.forEach(uni => {
      if (!uniqueNames.has(uni.shortName)) {
        const baseName = uni.name.split(' (')[0];
        uniqueNames.set(uni.shortName, baseName);
      }
    });
    return Array.from(uniqueNames.values()).sort();
  };

  const getCampusesForUniversity = (universityBaseName: string) => {
    return universities
      .filter(uni => uni.name.startsWith(universityBaseName))
      .map(uni => ({
        campus: uni.campus,
        fullName: uni.name
      }));
  };

  return (
    <div className="space-y-6">
      {/* Info boxes for logged-in users */}
      {user && !hasSavedProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/10 border border-primary/20 rounded-xl"
        >
          <p className="text-sm text-primary-foreground/80">
            👋 <strong>Welcome!</strong> Your first university selection will be automatically saved as your primary preference.
            You can manage this anytime in your <a href="/profile" className="underline hover:text-white font-semibold">Profile</a>.
          </p>
        </motion.div>
      )}

      {user && hasSavedProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <p className="text-sm text-blue-200">
            💡 <strong>Quick Analysis:</strong> Changes here are temporary and won't affect your saved preferences.
            To update your default settings, visit your <a href="/profile" className="underline hover:text-blue-100">Profile</a>.
          </p>
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-white/80 font-medium">
                Go unlimited with an account!
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                Log in to save your university, campus, and full schedule permanently.
                You can still use Stratus as a guest right now, but your selections won't be saved for next time.
              </p>
              <div className="pt-2">
                <a
                  href="/api/auth/login"
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  Sign up or Login <LogIn className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Campus Selection */}
      <GlassCard delay={0.1}>
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-primary w-5 h-5" />
          <h2 className="text-xl font-semibold">Select Your Campus</h2>
        </div>
        <div className="space-y-4">
          {/* University Selection */}
          <div className="relative">
            <select
              value={selectedUniversity}
              onChange={(e) => onUniversityChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-gray-900">Select a university...</option>
              {getUniversityNames().map((uniName) => (
                <option key={uniName} value={uniName} className="bg-gray-900">
                  {uniName}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {/* Campus Selection (only if multiple campuses) */}
          {selectedUniversity && getCampusesForUniversity(selectedUniversity).length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="relative"
            >
              <select
                value={selectedCampus}
                onChange={(e) => onCampusChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-gray-900">Select a campus...</option>
                {getCampusesForUniversity(selectedUniversity).map((campus) => (
                  <option key={campus.campus} value={campus.campus} className="bg-gray-900">
                    {campus.campus}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <ChevronDown className="w-5 h-5" />
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Date Selection */}
      <GlassCard delay={0.2}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-primary w-5 h-5" />
          <h2 className="text-xl font-semibold">Select Analysis Day</h2>
        </div>
        <div className="relative">
          <select
            value={selectedDay}
            onChange={(e) => onDayChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            {dayOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </GlassCard>

      {/* Schedule Selection */}
      <GlassCard delay={0.3}>
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="text-primary w-5 h-5" />
          <h2 className="text-xl font-semibold">Schedule</h2>
        </div>

        {user && savedScheduleFileName ? (
          // Logged in with saved schedule
          <div className="space-y-4">
            {/* Toggle between saved and upload */}
            <div className="flex gap-2">
              <button
                onClick={() => onToggleSavedSchedule(true)}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  usesSavedSchedule
                    ? "bg-primary text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              >
                Use Saved Schedule
              </button>
              <button
                onClick={() => onToggleSavedSchedule(false)}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  !usesSavedSchedule
                    ? "bg-primary text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              >
                Upload New
              </button>
            </div>

            {usesSavedSchedule ? (
              // Show saved schedule info
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Your Saved Schedule</p>
                    <p className="font-medium text-lg">
                      {savedClassesCount} {savedClassesCount === 1 ? 'Class' : 'Classes'} Loaded
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Ready to analyze
                    </p>
                  </div>
                  <a
                    href="/profile"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
                  >
                    Edit Schedule
                  </a>
                </div>
              </div>
            ) : (
              // Show upload option
              <FileUpload
                onFileSelect={onFileChange}
                uploadedFileName={!usesSavedSchedule ? uploadedFile?.name : undefined}
                disabled={isLoading}
              />
            )}
          </div>
        ) : (
          // Not logged in or no saved schedule - show upload only
          <FileUpload
            onFileSelect={onFileChange}
            uploadedFileName={uploadedFile?.name}
            disabled={isLoading}
          />
        )}
      </GlassCard>
    </div>
  );
}
