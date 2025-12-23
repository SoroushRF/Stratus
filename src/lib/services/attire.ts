import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData } from "./weather";
import { ClothingPlan } from "@/types/attire";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Uses Gemini to generate a personalized clothing and accessory plan
 * based on specific weather conditions.
 */
export const generateAttirePlan = async (
  weather: WeatherData,
  className: string,
  time: string
): Promise<ClothingPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    You are a professional personal stylist and weather expert.
    A student has a class called "${className}" at ${time}.
    The weather forecast for that specific time is:
    - Temperature: ${weather.temp}°C
    - Feels Like: ${weather.feels_like}°C
    - Condition: ${weather.condition}
    - Precipitation Chance: ${Math.round(weather.precipChance * 100)}%
    - Wind Speed: ${weather.windSpeed} m/s

    Task: Suggest a specific, stylish, and practical outfit for this student.
    Consider the transition between outdoors and indoors.

    Return ONLY a valid JSON object with the following schema:
    {
      "outerwear": string (e.g., "Light denim jacket", "Heavy down parka"),
      "top": string (e.g., "Breathable cotton t-shirt", "Thermal long-sleeve"),
      "bottom": string (e.g., "Comfortable chinos", "Insulated leggings"),
      "footwear": string (e.g., "Waterproof sneakers", "Leather boots"),
      "accessories": string[] (e.g., ["Compact umbrella", "Sunglasses"]),
      "rationale": string (A one-sentence explanation of why this outfit works for these conditions)
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    return JSON.parse(jsonMatch[0]) as ClothingPlan;
  } catch (error) {
    console.error("Attire AI Error:", error);
    // Fallback attire if AI fails
    return {
      outerwear: "Standard jacket",
      top: "Regular shirt",
      bottom: "Jeans",
      footwear: "Sneakers",
      accessories: ["Backpack"],
      rationale: "Defaulting to comfortable campus basics due to sync issues."
    };
  }
};
