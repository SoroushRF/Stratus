"use server";

import { extractSchedule } from "@/lib/services/gemini";
import { generateDayRecommendations } from "@/lib/utils/attireProcessor";
import { generateMasterRecommendation } from "@/lib/services/attire";
import { getWeatherForecast } from "@/lib/services/weather";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { ClassAttireRecommendation } from "@/types";

export async function processSchedule(base64Data: string, mimeType: string) {
  try {
    // Basic backend size check (5MB limit)
    // Base64 is ~33% larger than binary, so 5MB binary is ~6.7MB Base64
    const approxSizeInBytes = (base64Data.length * 3) / 4;
    if (approxSizeInBytes > 5 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    const classes = await extractSchedule(base64Data, mimeType);
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getWeatherForecastAction(
  lat: number,
  lng: number,
  date: string
) {
  try {
    const weatherData = await getWeatherForecast(lat, lng, date);
    return { success: true, data: weatherData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function generateAttireRecommendationsAction(
  classWeatherMatches: ClassWeatherMatch[]
) {
  try {
    const recommendations = await generateDayRecommendations(classWeatherMatches);
    return { success: true, data: recommendations };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function generateMasterRecommendationAction(
  recommendations: ClassAttireRecommendation[]
) {
  try {
    const masterRec = await generateMasterRecommendation(recommendations);
    return { success: true, data: masterRec };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

import { supabaseAdmin } from "@/lib/supabase";
import universitiesData from "@/lib/data/universities.json";
import { University } from "@/types";

export async function getUniversitiesAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('universities')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.log('ℹ️ Falling back to local universities.json');
      return { success: true, data: universitiesData as University[], isFallback: true };
    }

    // Map database fields to the University type expected by the frontend
    const mappedData: University[] = data.map(uni => ({
      name: uni.name,
      shortName: uni.short_name,
      campus: uni.campus,
      lat: uni.lat,
      lng: uni.lng
    }));

    return { success: true, data: mappedData, isFallback: false };
  } catch (error) {
    console.error('Error fetching universities:', error);
    return { success: true, data: universitiesData as University[], isFallback: true };
  }
}
