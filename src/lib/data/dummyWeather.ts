/**
 * Dummy Weather Data Converter
 * Converts OpenWeather API format to our internal WeatherData format
 */

import { WeatherData, HourlyForecast } from "@/types";
import openWeatherRaw from "./openWeatherDummy.json";

/**
 * Convert OpenWeather hourly entry to our HourlyForecast format
 */
function convertOpenWeatherHour(entry: any): HourlyForecast {
  const date = new Date(entry.dt * 1000); // Convert Unix timestamp to Date
  const hour = date.getHours().toString().padStart(2, "0") + ":00";

  return {
    hour,
    temp: Math.round(entry.temp * 10) / 10, // Round to 1 decimal
    feelsLike: Math.round(entry.feels_like * 10) / 10,
    condition: entry.weather[0].main,
    windSpeed: Math.round(entry.wind_speed * 3.6 * 10) / 10, // Convert m/s to km/h
    humidity: entry.pop * 100, // Use pop as humidity proxy for now
  };
}

/**
 * Get weather data for a specific date
 * @param targetDate - ISO date string (YYYY-MM-DD)
 * @returns WeatherData for that day
 */
export function getDummyWeatherForDate(targetDate: string): WeatherData {
  const target = new Date(targetDate);
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();

  console.log("getDummyWeatherForDate called with:", targetDate);
  console.log("Target month/day:", targetMonth, targetDay);

  // Filter hourly data for the target date (ignoring year)
  const dayForecasts = openWeatherRaw.hourly
    .map((entry: any) => {
      const entryDate = new Date(entry.dt * 1000);
      const entryMonth = entryDate.getMonth();
      const entryDay = entryDate.getDate();
      return {
        entry,
        matches: entryMonth === targetMonth && entryDay === targetDay,
      };
    })
    .filter((item: any) => item.matches)
    .map((item: any) => convertOpenWeatherHour(item.entry));

  console.log("Found", dayForecasts.length, "hourly forecasts for", targetDate);

  return {
    location: "Dummy Campus",
    date: targetDate,
    hourlyForecasts: dayForecasts,
  };
}

/**
 * Default export for backward compatibility
 */
export const dummyWeatherData: WeatherData = getDummyWeatherForDate(
  new Date().toISOString().split("T")[0]
);
