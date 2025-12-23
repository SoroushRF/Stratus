const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temp: number;
  condition: string;
  feels_like: number;
  precipChance: number;
  windSpeed: number;
  icon: string;
}

/**
 * Fetches the 5-day / 3-hour forecast for a specific location.
 * Uses Metric units (Celsius) by default.
 */
export const getForecast = async (lat: number, lon: number): Promise<any> => {
  if (!API_KEY) {
    console.warn("OPENWEATHER_API_KEY is not defined. Returning mock forecast.");
    return {
      list: Array.from({ length: 40 }, (_, i) => ({
        dt: Math.floor(Date.now() / 1000) + i * 3600 * 3,
        main: { temp: 20 + Math.random() * 5, feels_like: 18 + Math.random() * 5 },
        weather: [{ main: "Clear", icon: "01d" }],
        pop: 0.1,
        wind: { speed: 5 }
      }))
    };
  }

  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Weather API Error: ${errorData.message}`);
  }

  return await response.json();
};

/**
 * Filters the forecast to find the closest weather data for a specific date and time.
 * @param forecastData The raw JSON response from OpenWeather forecast API
 * @param targetDateTime ISO string or Date object for the class time
 */
export const findClosestForecast = (
  forecastData: any,
  targetDateTime: string | Date
): WeatherData => {
  const targetEpoch = new Date(targetDateTime).getTime() / 1000;
  
  // OpenWeather returns a 'list' of 40 forecast points
  const closest = forecastData.list.reduce((prev: any, curr: any) => {
    return Math.abs(curr.dt - targetEpoch) < Math.abs(prev.dt - targetEpoch) ? curr : prev;
  });

  return {
    temp: closest.main.temp,
    feels_like: closest.main.feels_like,
    condition: closest.weather[0].main,
    icon: closest.weather[0].icon,
    precipChance: closest.pop || 0, // 'pop' is Probability of Precipitation (0 to 1)
    windSpeed: closest.wind.speed,
  };
};
