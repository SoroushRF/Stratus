import { WeatherData, HourlyForecast } from "@/types";
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
 * OpenWeather API Service
 * Fetches live weather data from OpenWeather API (5-Day/3-Hour Forecast)
 */
class OpenWeatherService implements WeatherService {
  private apiKey: string;
  private baseUrl = "https://api.openweathermap.org/data/2.5/forecast";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getHourlyForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    console.log(`[LIVE] Fetching weather from OpenWeather API for ${lat}, ${lng} on ${date}`);
    
    const url = `${this.baseUrl}?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the target date
      const targetDate = new Date(date);
      const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Filter forecasts for the target date and convert to our format
      const hourlyForecasts: HourlyForecast[] = data.list
        .filter((item: any) => {
          const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0];
          return forecastDate === targetDateStr;
        })
        .map((item: any) => {
          const forecastTime = new Date(item.dt * 1000);
          const hour = forecastTime.getHours().toString().padStart(2, '0');
          
          return {
            hour: `${hour}:00`,
            temp: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            condition: this.mapWeatherCondition(item.weather[0].main),
            humidity: item.main.humidity,
            windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
          };
        });

      if (hourlyForecasts.length === 0) {
        throw new Error(`No weather data available for ${date}`);
      }

      return {
        location: data.city.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        date: targetDateStr,
        hourlyForecasts,
      };
    } catch (error) {
      console.error("[LIVE] OpenWeather API failed:", error);
      throw error;
    }
  }

  /**
   * Map OpenWeather condition codes to our simplified conditions
   */
  private mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'Clear',
      'Clouds': 'Cloudy',
      'Rain': 'Rainy',
      'Drizzle': 'Rainy',
      'Thunderstorm': 'Stormy',
      'Snow': 'Snowy',
      'Mist': 'Cloudy',
      'Fog': 'Cloudy',
    };
    
    return conditionMap[condition] || 'Cloudy';
  }
}

/**
 * Hybrid Weather Service with Fallback
 * Tries live API first, falls back to dummy data on failure
 */
class HybridWeatherService implements WeatherService {
  private liveService: OpenWeatherService;
  private dummyService: DummyWeatherService;

  constructor(apiKey: string) {
    this.liveService = new OpenWeatherService(apiKey);
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
const API_KEY = process.env.OPENWEATHER_API_KEY || "";

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
  return weatherService.getHourlyForecast(lat, lng, date);
}
