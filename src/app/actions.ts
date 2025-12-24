"use server";

import { extractSchedule } from "@/lib/services/gemini";
import { generateDayRecommendations } from "@/lib/utils/attireProcessor";
import { generateMasterRecommendation } from "@/lib/services/attire";
import { getWeatherForecast } from "@/lib/services/weather";
import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { ClassAttireRecommendation } from "@/types";

export async function processSchedule(base64Data: string, mimeType: string) {
  try {
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
