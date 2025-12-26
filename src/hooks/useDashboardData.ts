'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUniversitiesAction } from '@/app/actions';
import { University, ParsedClass } from '@/types';

// =====================================================
// TYPES
// =====================================================

export interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'maintenance';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface UserProfile {
  university: string;
  campus: string;
}

export interface SavedSchedule {
  parsed_classes: ParsedClass[];
  file_name: string;
}

export interface DashboardDataState {
  // System Notices
  systemNotice: SystemNotice | null;
  noticeLoading: boolean;
  dismissNotice: () => void;

  // Universities
  universities: University[];
  universitiesLoading: boolean;

  // User Profile
  hasSavedProfile: boolean;
  savedUniversity: string;
  savedCampus: string;

  // User Schedule
  savedClasses: ParsedClass[];
  savedScheduleFileName: string | null;

  // Overall loading state
  dataLoaded: boolean;

  // Actions
  saveInitialPreferences: (university: string, campus: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useDashboardData(userId: string | null): DashboardDataState {
  // --- System Notices ---
  const [systemNotice, setSystemNotice] = useState<SystemNotice | null>(null);
  const [noticeLoading, setNoticeLoading] = useState(true);

  // --- Universities ---
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);

  // --- User Profile ---
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [savedUniversity, setSavedUniversity] = useState('');
  const [savedCampus, setSavedCampus] = useState('');

  // --- User Schedule ---
  const [savedClasses, setSavedClasses] = useState<ParsedClass[]>([]);
  const [savedScheduleFileName, setSavedScheduleFileName] = useState<string | null>(null);

  // --- Meta State ---
  const [dataLoaded, setDataLoaded] = useState(false);

  // =====================================================
  // LOADERS
  // =====================================================

  // Load system notices (runs once on mount)
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await fetch('/api/notices/active');
        if (res.ok) {
          const { data } = await res.json();
          if (data && data.length > 0) {
            setSystemNotice(data[0]); // Show highest priority notice
          }
        }
      } catch (err) {
        console.error('Error loading system notices:', err);
      } finally {
        setNoticeLoading(false);
      }
    };
    loadNotices();
  }, []);

  // Load universities (runs once on mount)
  useEffect(() => {
    const loadUniversities = async () => {
      const result = await getUniversitiesAction();
      if (result.success && result.data) {
        setUniversities(result.data);
      }
      setUniversitiesLoading(false);
    };
    loadUniversities();
  }, []);

  // Load user profile & schedule when user is available
  useEffect(() => {
    if (userId && !universitiesLoading && !dataLoaded) {
      loadSavedData();
    } else if (!userId && !universitiesLoading) {
      // Guest user - mark data as loaded
      setDataLoaded(true);
    }
  }, [userId, universitiesLoading, dataLoaded]);

  const loadSavedData = async () => {
    try {
      // Load profile
      const profileRes = await fetch('/api/user/profile');
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        if (profile && (profile.university || profile.campus)) {
          setSavedUniversity(profile.university || '');
          setSavedCampus(profile.campus || '');
          setHasSavedProfile(true);
          console.log('✅ Loaded saved profile:', profile);
        }
      }

      // Load schedule
      const scheduleRes = await fetch('/api/user/schedule');
      if (scheduleRes.ok) {
        const { schedule } = await scheduleRes.json();
        if (schedule) {
          setSavedClasses(schedule.parsed_classes);
          setSavedScheduleFileName(schedule.file_name);
          console.log('✅ Loaded saved schedule:', schedule.file_name);
        }
      }

      setDataLoaded(true);
    } catch (err) {
      console.error('Error loading saved data:', err);
      setDataLoaded(true); // Still mark as loaded to prevent infinite loop
    }
  };

  // =====================================================
  // ACTIONS
  // =====================================================

  const dismissNotice = useCallback(() => {
    setSystemNotice(null);
  }, []);

  const saveInitialPreferences = useCallback(
    async (university: string, campus: string): Promise<boolean> => {
      if (!university || !campus || hasSavedProfile) return false;

      try {
        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ university, campus }),
        });

        if (res.ok) {
          console.log('✅ Saved initial preferences');
          setHasSavedProfile(true);
          setSavedUniversity(university);
          setSavedCampus(campus);
          return true;
        }
      } catch (err) {
        console.error('Error saving initial preferences:', err);
      }
      return false;
    },
    [hasSavedProfile]
  );

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      const profileRes = await fetch('/api/user/profile');
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        if (profile) {
          setSavedUniversity(profile.university || '');
          setSavedCampus(profile.campus || '');
          setHasSavedProfile(true);
        }
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }, [userId]);

  // =====================================================
  // RETURN STATE
  // =====================================================

  return {
    // System Notices
    systemNotice,
    noticeLoading,
    dismissNotice,

    // Universities
    universities,
    universitiesLoading,

    // User Profile
    hasSavedProfile,
    savedUniversity,
    savedCampus,

    // User Schedule
    savedClasses,
    savedScheduleFileName,

    // Overall loading state
    dataLoaded,

    // Actions
    saveInitialPreferences,
    refreshProfile,
  };
}
