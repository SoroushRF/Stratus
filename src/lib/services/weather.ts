import { WeatherData, HourlyForecast } from "@/types";
import { getDummyWeatherForDate } from "@/lib/data/dummyWeather";
import AIConfigService from "./ai-config";

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
 */
class DummyWeatherService implements WeatherService {
  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    console.log(`[DUMMY] Fetching weather for ${lat}, ${lng} on ${date}`);
    const weatherData = getDummyWeatherForDate(date);
    
    return {
      ...weatherData,
      location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
}

/**
 * Live Weather API Service
 * Fetches real-time weather data from external API (currently Tomorrow.io)
 */
class LiveWeatherService implements WeatherService {
  private apiKey: string;
  private baseUrl = "https://api.tomorrow.io/v4/timelines";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    console.log(`[LIVE] Fetching weather from API for ${lat}, ${lng} on ${date}`);
    
    const targetDate = new Date(date);
    const startTime = new Date(targetDate);
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(targetDate);
    endTime.setHours(23, 59, 59, 999);

    const url = `${this.baseUrl}?location=${lat},${lng}&fields=temperature,temperatureApparent,weatherCode,humidity,windSpeed&timesteps=1h&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&apikey=${this.apiKey}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      // Increment usage count in DB
      await AIConfigService.incrementWeatherUsage();

      const data = await response.json();
      
      if (!data.data?.timelines?.[0]?.intervals) {
        throw new Error("Invalid API response format");
      }

      const intervals = data.data.timelines[0].intervals;

      // Convert to our format
      const hourlyForecasts: HourlyForecast[] = intervals.map((interval: any) => {
        const time = new Date(interval.startTime);
        const hour = time.getHours().toString().padStart(2, '0');
        const values = interval.values;
        
        return {
          hour: `${hour}:00`,
          temp: Math.round(values.temperature),
          feelsLike: Math.round(values.temperatureApparent),
          condition: this.mapWeatherCode(values.weatherCode),
          humidity: Math.round(values.humidity),
          windSpeed: Math.round(values.windSpeed),
        };
      });

      if (hourlyForecasts.length === 0) {
        throw new Error(`No weather data available for ${date}`);
      }

      return {
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        date: date,
        hourlyForecasts,
      };
    } catch (error) {
      console.error("[LIVE] Weather API failed:", error);
      throw error;
    }
  }

  /**
   * Map Tomorrow.io weather codes to our simplified conditions
   * https://docs.tomorrow.io/reference/data-layers-weather-codes
   */
  private mapWeatherCode(code: number): string {
    if (code === 1000) return 'Clear';
    if ([1100, 1101, 1102].includes(code)) return 'Cloudy';
    if ([4000, 4001, 4200, 4201].includes(code)) return 'Rainy';
    if ([2000, 2100].includes(code)) return 'Cloudy'; // Fog
    if ([5000, 5001, 5100, 5101].includes(code)) return 'Snowy';
    if ([8000].includes(code)) return 'Stormy';
    return 'Cloudy';
  }
}

/**
 * Hybrid Weather Service with Fallback
 * Tries live API first, falls back to dummy data on failure
 */
class HybridWeatherService implements WeatherService {
  private liveService: LiveWeatherService;
  private dummyService: DummyWeatherService;

  constructor(apiKey: string) {
    this.liveService = new LiveWeatherService(apiKey);
    this.dummyService = new DummyWeatherService();
  }

  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    try {
      return await this.liveService.getHourlyForecast(lat, lng, date);
    } catch (error) {
      console.warn("[HYBRID] Live API failed, falling back to dummy data:", error);
      return await this.dummyService.getHourlyForecast(lat, lng, date);
    }
  }
}

/**
 * Weather Service Factory
 * Toggle between modes using USE_LIVE_WEATHER environment variable
 */
const USE_LIVE_WEATHER = process.env.USE_LIVE_WEATHER === "true";
const API_KEY = process.env.WEATHER_API_KEY || "";

export const weatherService: WeatherService = USE_LIVE_WEATHER
  ? new HybridWeatherService(API_KEY)
  : new DummyWeatherService();

console.log(`[WEATHER] Service initialized: ${USE_LIVE_WEATHER ? 'LIVE (with fallback)' : 'DUMMY'}`);

/**
 * Get weather forecast for a specific location and date
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  date: string
): Promise<WeatherData> {
  // Check maintenance mode
  if (await AIConfigService.isMaintenanceMode()) {
    console.log("[WEATHER] Skipping live fetch - Maintenance mode active");
    // Fall back to dummy for a better UX, or throw? 
    // Let's fallback to dummy so the app stays "usable" but doesn't hit the paid API
    const dummy = new (require('./weather').DummyWeatherService)();
    return dummy.getHourlyForecast(lat, lng, date);
  }
  return weatherService.getHourlyForecast(lat, lng, date);
}
