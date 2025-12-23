import { ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { ClassAttireRecommendation } from "@/types";
import { generateAttireRecommendation, getBasicAttireRecommendation } from "@/lib/services/attire";

/**
 * Generate attire recommendations for all classes in a day
 * @param classWeatherMatches - Array of class-weather pairs
 * @returns Array of class-weather-attire recommendations
 */
export async function generateDayRecommendations(
  classWeatherMatches: ClassWeatherMatch[]
): Promise<ClassAttireRecommendation[]> {
  const recommendations: ClassAttireRecommendation[] = [];

  for (const match of classWeatherMatches) {
    try {
      // Try AI-powered recommendation
      const attire = await generateAttireRecommendation(
        match.class,
        match.weather
      );

      recommendations.push({
        class: match.class,
        weather: match.weather,
        attire: attire,
      });
    } catch (error) {
      console.error(`Failed to generate recommendation for ${match.class.name}:`, error);

      // Fallback to rule-based recommendation
      const fallbackAttire = getBasicAttireRecommendation(match.weather);

      recommendations.push({
        class: match.class,
        weather: match.weather,
        attire: fallbackAttire,
      });
    }
  }

  return recommendations;
}
