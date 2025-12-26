"use server";

import { extractSchedule } from "@/lib/services/gemini";
import { generateDayRecommendations } from "@/lib/utils/attireProcessor";
import { generateMasterRecommendation } from "@/lib/services/attire";
import { getWeatherForecast } from "@/lib/services/weather";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { ClassAttireRecommendation } from "@/types";
import { supabaseAdmin } from "@/lib/supabase";
import universitiesData from "@/lib/data/universities.json";
import { University } from "@/types";

// Import Zod schemas
import {
  ScheduleFileSchema,
  WeatherRequestSchema,
  UniversitySchema,
} from "@/lib/schemas";

// =====================================================
// SCHEDULE PROCESSING
// =====================================================

export async function processSchedule(base64Data: string, mimeType: string) {
  try {
    // Validate input with Zod
    const validatedInput = ScheduleFileSchema.parse({
      base64: base64Data,
      mimeType,
      name: "schedule", // Name is not critical for processing
    });

    // Backend size check (5MB limit)
    const approxSizeInBytes = (validatedInput.base64.length * 3) / 4;
    if (approxSizeInBytes > 5 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    const classes = await extractSchedule(validatedInput.base64, validatedInput.mimeType);
    return { success: true, data: classes };
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: error.message };
  }
}

// =====================================================
// WEATHER FORECAST
// =====================================================

export async function getWeatherForecastAction(
  lat: number,
  lng: number,
  date: string
) {
  try {
    // Validate input with Zod
    const validatedInput = WeatherRequestSchema.parse({ lat, lng, date });

    const weatherData = await getWeatherForecast(
      validatedInput.lat,
      validatedInput.lng,
      validatedInput.date
    );
    return { success: true, data: weatherData };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      return { success: false, error: `Invalid weather request: ${firstError.message}` };
    }
    return { success: false, error: error.message };
  }
}

// =====================================================
// ATTIRE RECOMMENDATIONS
// =====================================================

export async function generateAttireRecommendationsAction(
  classWeatherMatches: ClassWeatherMatch[]
) {
  try {
    // Validate that we have matches
    if (!classWeatherMatches || classWeatherMatches.length === 0) {
      throw new Error("No class-weather matches provided");
    }

    const recommendations = await generateDayRecommendations(classWeatherMatches);
    return { success: true, data: recommendations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// MASTER RECOMMENDATION
// =====================================================

export async function generateMasterRecommendationAction(
  recommendations: ClassAttireRecommendation[]
) {
  try {
    // Validate that we have recommendations
    if (!recommendations || recommendations.length === 0) {
      throw new Error("No recommendations provided");
    }

    const masterRec = await generateMasterRecommendation(recommendations);
    return { success: true, data: masterRec };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// UNIVERSITIES
// =====================================================

export async function getUniversitiesAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('universities')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.log('ℹ️ Falling back to local universities.json');
      
      // Validate fallback data
      const validatedData = data || universitiesData;
      const universities = validatedData.map((uni: any) => 
        UniversitySchema.parse({
          name: uni.name,
          shortName: uni.short_name || uni.shortName,
          campus: uni.campus,
          lat: uni.lat,
          lng: uni.lng,
        })
      );
      
      return { success: true, data: universities, isFallback: true };
    }

    // Validate and map database fields
    const mappedData: University[] = data.map(uni => 
      UniversitySchema.parse({
        name: uni.name,
        shortName: uni.short_name,
        campus: uni.campus,
        lat: uni.lat,
        lng: uni.lng,
      })
    );

    return { success: true, data: mappedData, isFallback: false };
  } catch (error: any) {
    console.error('Error fetching universities:', error);
    
    // Fallback with validation
    try {
      const universities = universitiesData.map((uni: any) => 
        UniversitySchema.parse({
          name: uni.name,
          shortName: uni.shortName,
          campus: uni.campus,
          lat: uni.lat,
          lng: uni.lng,
        })
      );
      return { success: true, data: universities, isFallback: true };
    } catch (validationError) {
      return { success: false, error: 'Failed to load universities' };
    }
  }
}
