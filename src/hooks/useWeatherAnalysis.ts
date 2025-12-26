'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  processSchedule,
  getWeatherForecastAction,
  generateAttireRecommendationsAction,
  generateMasterRecommendationAction,
} from '@/app/actions';
import { ParsedClass, University, ClassAttireRecommendation, MasterRecommendation } from '@/types';
import { matchClassesToWeather, filterClassesByDay, ClassWeatherMatch } from '@/lib/utils/weatherMatcher';
import { resolveAnalysisDay, getDateForAnalysisDay } from '@/lib/utils/dateHelpers';

// =====================================================
// TYPES
// =====================================================

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface AnalysisParams {
  selectedDay: string;
  university: University;
  uploadedFile: UploadedFile | null;
  savedClasses: ParsedClass[];
  usesSavedSchedule: boolean;
  userId: string | null;
  savedScheduleFileName: string | null;
}

export interface AnalysisResults {
  classWeatherMatches: ClassWeatherMatch[];
  classAttireRecommendations: ClassAttireRecommendation[];
  masterRecommendation: MasterRecommendation | null;
  fullWeatherData: any;
}

export interface WeatherAnalysisState {
  // Status
  status: AnalysisStatus;
  loadingStep: string;
  error: string | null;

  // Parsed Data
  classes: ParsedClass[];
  setClasses: (classes: ParsedClass[]) => void;

  // Results
  classWeatherMatches: ClassWeatherMatch[];
  classAttireRecommendations: ClassAttireRecommendation[];
  masterRecommendation: MasterRecommendation | null;
  fullWeatherData: any;

  // Actions
  analyze: (params: AnalysisParams) => Promise<void>;
  reset: () => void;
}

// =====================================================
// HELPER: Get day label for error messages
// =====================================================

function getDayLabel(selectedDay: string): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const today = new Date();
  const todayIndex = today.getDay();

  if (selectedDay === 'today') return `Today (${days[todayIndex]})`;
  if (selectedDay === 'tomorrow') return `Tomorrow (${days[(todayIndex + 1) % 7]})`;
  return selectedDay;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useWeatherAnalysis(): WeatherAnalysisState {
  const router = useRouter();

  // --- Status ---
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // --- Parsed Classes (can be from upload or saved) ---
  const [classes, setClasses] = useState<ParsedClass[]>([]);

  // --- Results ---
  const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
  const [classAttireRecommendations, setClassAttireRecommendations] = useState<ClassAttireRecommendation[]>([]);
  const [masterRecommendation, setMasterRecommendation] = useState<MasterRecommendation | null>(null);
  const [fullWeatherData, setFullWeatherData] = useState<any>(null);

  // =====================================================
  // MAIN ANALYSIS FLOW
  // =====================================================

  const analyze = useCallback(
    async (params: AnalysisParams) => {
      const {
        selectedDay,
        university,
        uploadedFile,
        savedClasses,
        usesSavedSchedule,
        userId,
        savedScheduleFileName,
      } = params;

      setStatus('loading');
      setError(null);
      
      const analysisPromise = (async () => {
        try {
          let parsedClasses: ParsedClass[];

        // ===== STEP 1: Determine schedule source =====
        if (userId && usesSavedSchedule && savedClasses.length > 0) {
          // Using saved schedule - classes are already parsed
          setLoadingStep('Using saved schedule...');
          parsedClasses = savedClasses;
        } else if (uploadedFile) {
          // Uploading new file - need to parse
          setLoadingStep('Parsing schedule with AI...');
          const response = await processSchedule(uploadedFile.base64, uploadedFile.mimeType);

          if (response.success && response.data) {
            parsedClasses = response.data;
            setClasses(parsedClasses);

            // Auto-save schedule for first-time users
            if (userId && !savedScheduleFileName && uploadedFile) {
              try {
                await fetch('/api/user/schedule', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fileName: uploadedFile.name,
                    parsedClasses: parsedClasses,
                  }),
                });
                console.log('✅ Saved initial schedule');
              } catch (err) {
                console.error('Error saving initial schedule:', err);
              }
            }
          } else {
            setStatus('error');
            setError(response.error || 'Failed to parse schedule.');
            setLoadingStep('');
            return;
          }
        } else {
          setStatus('error');
          setError('Please upload a schedule or use your saved schedule.');
          setLoadingStep('');
          return;
        }

        // ===== Shared validation =====
        if (!university) {
          setStatus('error');
          setError('Selected university not found. Please select a valid campus from the list.');
          setLoadingStep('');
          return;
        }

        const actualDay = resolveAnalysisDay(selectedDay);
        const analysisDate = getDateForAnalysisDay(selectedDay);

        console.log('🔍 Analysis Debug:');
        console.log('Selected Day:', selectedDay, '→ Resolved:', actualDay);
        console.log('Total Classes:', parsedClasses.length);

        const dayClasses = filterClassesByDay(parsedClasses, actualDay);
        console.log('Classes for', actualDay, ':', dayClasses.length);

        if (dayClasses.length === 0) {
          setStatus('error');
          setError(`No classes found for ${getDayLabel(selectedDay)}.`);
          setLoadingStep('');
          return;
        }

        // ===== STEP 2: Fetch weather data =====
        setLoadingStep(`Fetching weather data for ${university.shortName}...`);

        let weatherData;
        try {
          const weatherResponse = await getWeatherForecastAction(university.lat, university.lng, analysisDate);
          if (!weatherResponse.success || !weatherResponse.data) {
            throw new Error(weatherResponse.error || 'Failed to fetch weather');
          }
          weatherData = weatherResponse.data;
          setFullWeatherData(weatherData);
        } catch (weatherError) {
          console.error('Weather fetch failed:', weatherError);
          setStatus('error');
          setError('Failed to fetch weather data. Please try again.');
          setLoadingStep('');
          return;
        }

        // ===== STEP 3: Match classes to weather =====
        const matches = matchClassesToWeather(dayClasses, weatherData);
        setClassWeatherMatches(matches);

        const hasWeatherData = matches.some((m) => m.weather !== null);
        if (!hasWeatherData) {
          setStatus('error');
          setError('No weather data available for the selected date.');
          setLoadingStep('');
          return;
        }

        // ===== STEP 4: Generate attire recommendations =====
        setLoadingStep('Generating clothing recommendations...');
        const attireResponse = await generateAttireRecommendationsAction(matches);

        if (!attireResponse.success || !attireResponse.data) {
          setStatus('error');
          setError('Failed to generate recommendations. Please try again.');
          setLoadingStep('');
          return;
        }

        const attireRecs = attireResponse.data;
        setClassAttireRecommendations(attireRecs);

        // ===== STEP 5: Generate master recommendation =====
        setLoadingStep('Finalizing outfit strategy...');
        const masterResponse = await generateMasterRecommendationAction(attireRecs);

        let masterRec = null;
        if (masterResponse.success && masterResponse.data) {
          masterRec = masterResponse.data;
          setMasterRecommendation(masterRec);
        }

        // ===== STEP 6: Store results & redirect =====
        const analysisResults = {
          classWeatherMatches: matches,
          classAttireRecommendations: attireRecs,
          masterRecommendation: masterRec,
          fullWeatherData: weatherData,
          selectedDay,
          universityName: university.shortName,
        };
        sessionStorage.setItem('analysisResults', JSON.stringify(analysisResults));

        setStatus('success');
        setLoadingStep('');

        // Redirect to analysis page
        router.push('/analysis');
        return analysisResults;
      } catch (err) {
        console.error('Analysis error:', err);
        setStatus('error');
        setError('Error during analysis. Please try again.');
        setLoadingStep('');
        throw err;
      }
    })();

    toast.promise(analysisPromise, {
      loading: 'Calculating your atmospheric profile...',
      success: () => 'Analysis complete! Check your roadmap.',
      error: (err) => err.message || 'The analysis encountered a storm. Please try again.',
    });
  },
  [router]
);

  // =====================================================
  // RESET
  // =====================================================

  const reset = useCallback(() => {
    setStatus('idle');
    setLoadingStep('');
    setError(null);
    setClassWeatherMatches([]);
    setClassAttireRecommendations([]);
    setMasterRecommendation(null);
    setFullWeatherData(null);
  }, []);

  // =====================================================
  // RETURN STATE
  // =====================================================

  return {
    // Status
    status,
    loadingStep,
    error,

    // Parsed Data
    classes,
    setClasses,

    // Results
    classWeatherMatches,
    classAttireRecommendations,
    masterRecommendation,
    fullWeatherData,

    // Actions
    analyze,
    reset,
  };
}
