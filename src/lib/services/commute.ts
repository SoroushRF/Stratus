import { CommuteMethod, CommuteAdvice } from "@/types";
import { WeatherData } from "./weather";

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Calculates commute time using Google Maps Distance Matrix API.
 * Falls back to estimated values if API key is missing.
 */
export const getCommuteTime = async (
  origin: string, // "lat,lng"
  destination: string, // "lat,lng"
  method: CommuteMethod
): Promise<number> => {
  if (!GOOGLE_MAPS_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY missing. Returning mock time.");
    const mocks = {
      [CommuteMethod.WALKING]: 20,
      [CommuteMethod.BIKING]: 10,
      [CommuteMethod.DRIVING]: 5,
      [CommuteMethod.TRANSIT]: 15,
    };
    return mocks[method];
  }

  const travelMode = {
    [CommuteMethod.WALKING]: "walking",
    [CommuteMethod.BIKING]: "bicycling",
    [CommuteMethod.DRIVING]: "driving",
    [CommuteMethod.TRANSIT]: "transit",
  }[method];

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${travelMode}&key=${GOOGLE_MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.rows[0].elements[0].status === "OK") {
      return Math.round(data.rows[0].elements[0].duration.value / 60);
    }
    return 15;
  } catch (error) {
    console.error("Maps API Error:", error);
    return 15;
  }
};

/**
 * Generates clothing and gear recommendations based on weather data.
 */
export const getClothingAdvice = (weather: WeatherData): string => {
  const { temp, feels_like, condition, precipChance } = weather;
  let advice = "";

  // 1. Temperature Base
  if (feels_like < -10) advice += "Arctic-grade parka, thermal base layers, and gloves are essential. ";
  else if (feels_like < 0) advice += "Heavy winter coat and a scarf. ";
  else if (feels_like < 10) advice += "Light jacket or a heavy sweater. ";
  else if (feels_like < 20) advice += "Long sleeves or a light hoodie. ";
  else advice += "T-shirt and light clothing. ";

  // 2. Precipitation
  if (precipChance > 0.4 || ["Rain", "Drizzle", "Thunderstorm"].includes(condition)) {
    advice += "Strong umbrella and waterproof shoes recommended. ";
  } else if (condition === "Snow") {
    advice += "Waterproof boots with good grip for ice. ";
  }

  return advice.trim();
};

/**
 * Converts a string address into "lat,lng" coordinates.
 */
export const getCoordinatesFromAddress = async (address: string): Promise<string | null> => {
  if (!GOOGLE_MAPS_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return `${lat},${lng}`;
    }
    return null;
  } catch (error) {
    console.error("Geocoding Error:", error);
    return null;
  }
};

/**
 * Master function to assemble all advice for a specific class instance.
 */
export const assembleRecommendation = async (
  origin: string,
  destination: string,
  method: CommuteMethod,
  weather: WeatherData
): Promise<CommuteAdvice> => {
  const estimatedTime = await getCommuteTime(origin, destination, method);
  const clothingRecommendation = getClothingAdvice(weather);

  let warning = "";
  if (weather.precipChance > 0.7 && method === CommuteMethod.BIKING) {
    warning = "Heavy rain expected. Biking may be unsafe; consider Transit or Driving.";
  } else if (weather.feels_like < -20) {
    warning = "Extreme cold alert. Limit exposed skin during your commute.";
  }

  return {
    method,
    estimatedTime,
    clothingRecommendation,
    warning,
  };
};
