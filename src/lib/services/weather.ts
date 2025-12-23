import { WeatherData } from "@/types";
import { getDummyWeatherForDate } from "@/lib/data/dummyWeather";

/**
 * Weather Service Interface
 * This abstraction allows us to swap between dummy data and live API calls
 * with minimal code changes.
 */
interface WeatherService {
  getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData>;
}

/**
 * Dummy Weather Service
 * Returns pre-written weather data for testing.
 * Will be replaced with live API calls in production.
 */
class DummyWeatherService implements WeatherService {
  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    // Get dummy data for the specific date
    const weatherData = getDummyWeatherForDate(date);
    
    // Update location to show coordinates
    return {
      ...weatherData,
      location: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
}

/**
 * OpenWeather API Service
 * Fetches live weather data from OpenWeather API.
 * Currently inactive - will be implemented after dummy data testing.
 */
class OpenWeatherService implements WeatherService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    // TODO: Implement OpenWeather API call
    // API endpoint: https://api.openweathermap.org/data/2.5/forecast
    // Parameters: lat, lon, appid, units=metric
    throw new Error("OpenWeather API not yet implemented");
  }
}

/**
 * Weather Service Factory
 * Toggle between dummy and live data by changing USE_DUMMY_DATA flag
 */
const USE_DUMMY_DATA = true; // Set to false when ready for live API

export const weatherService: WeatherService = USE_DUMMY_DATA
  ? new DummyWeatherService()
  : new OpenWeatherService(process.env.OPENWEATHER_API_KEY || "");

/**
 * Get weather forecast for a specific location and date
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  date: string
): Promise<WeatherData> {
  return weatherService.getHourlyForecast(lat, lng, date);
}
