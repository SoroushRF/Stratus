import { ParsedClass, HourlyForecast, WeatherData } from "@/types";

/**
 * Match each class to its corresponding weather forecast
 * based on the class start time.
 */
export interface ClassWeatherMatch {
  class: ParsedClass;
  weather: HourlyForecast | null;
}

/**
 * Find the nearest weather forecast for a given time
 * @param time - Time in "HH:MM" format (e.g., "09:30")
 * @param forecasts - Array of hourly forecasts
 * @returns The closest matching forecast or null if none found
 */
function findNearestForecast(
  time: string,
  forecasts: HourlyForecast[]
): HourlyForecast | null {
  if (forecasts.length === 0) return null;

  // Extract hour from time (e.g., "09:30" -> "09")
  const [hourStr] = time.split(":");
  const targetHour = parseInt(hourStr, 10);

  // Find exact match first
  const exactMatch = forecasts.find((f) => {
    const [fHourStr] = f.hour.split(":");
    return parseInt(fHourStr, 10) === targetHour;
  });

  if (exactMatch) return exactMatch;

  // If no exact match, find the closest hour
  let closest = forecasts[0];
  let minDiff = Math.abs(
    targetHour - parseInt(closest.hour.split(":")[0], 10)
  );

  for (const forecast of forecasts) {
    const fHour = parseInt(forecast.hour.split(":")[0], 10);
    const diff = Math.abs(targetHour - fHour);

    if (diff < minDiff) {
      minDiff = diff;
      closest = forecast;
    }
  }

  return closest;
}

/**
 * Match classes with their corresponding weather forecasts
 * @param classes - Array of parsed classes
 * @param weatherData - Weather data for the day
 * @returns Array of class-weather matches
 */
export function matchClassesToWeather(
  classes: ParsedClass[],
  weatherData: WeatherData
): ClassWeatherMatch[] {
  return classes.map((cls) => ({
    class: cls,
    weather: findNearestForecast(cls.startTime, weatherData.hourlyForecasts),
  }));
}

/**
 * Filter classes for a specific day
 * @param classes - All parsed classes
 * @param dayName - Day name (e.g., "MONDAY", "TUESDAY")
 * @returns Classes that occur on the specified day
 */
export function filterClassesByDay(
  classes: ParsedClass[],
  dayName: string
): ParsedClass[] {
  return classes.filter((cls) => cls.days?.includes(dayName as any));
}
