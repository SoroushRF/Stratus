export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface ParsedClass {
  name: string;
  startTime: string;
  endTime: string;
  days?: Day[];
  location?: string;
}

export interface University {
  name: string;
  shortName: string;
  campus: string;
  lat: number;
  lng: number;
}

export interface HourlyForecast {
  hour: string; // Format: "HH:00" (e.g., "09:00", "14:00")
  temp: number; // Temperature in Celsius
  feelsLike: number; // "Feels like" temperature in Celsius
  condition: string; // e.g., "Clear", "Rain", "Snow", "Cloudy"
  windSpeed: number; // Wind speed in km/h
  humidity: number; // Humidity percentage
}

export interface WeatherData {
  location: string; // Campus name
  date: string; // ISO date string
  hourlyForecasts: HourlyForecast[];
}

export interface AttireRecommendation {
  recommendation: string; // Brief outfit description
  reasoning: string; // Why this outfit works
  accessories: string[]; // Useful items to bring
  priority: "essential" | "suggested"; // How critical this recommendation is
}

export interface ClassAttireRecommendation {
  class: ParsedClass;
  weather: HourlyForecast | null;
  attire: AttireRecommendation;
}

export interface MasterRecommendation {
  baseOutfit: string; // Core outfit description
  layeringStrategy: string; // How to adjust throughout the day
  essentialAccessories: string[]; // Must-have items
  reasoning: string; // Why this outfit works
  weatherRange: {
    minTemp: number;
    maxTemp: number;
    conditions: string[]; // Unique weather conditions
  };
}
