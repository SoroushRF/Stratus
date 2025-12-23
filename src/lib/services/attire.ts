import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedClass, HourlyForecast, AttireRecommendation } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate clothing recommendation for a single class based on weather
 */
export async function generateAttireRecommendation(
  classInfo: ParsedClass,
  weather: HourlyForecast | null
): Promise<AttireRecommendation> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  // Calculate class duration
  const [startHour, startMin] = classInfo.startTime.split(":").map(Number);
  const [endHour, endMin] = classInfo.endTime.split(":").map(Number);
  const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  const durationHours = Math.round(durationMinutes / 60 * 10) / 10;

  // Determine time of day
  let timeOfDay = "morning";
  if (startHour >= 12 && startHour < 17) timeOfDay = "afternoon";
  else if (startHour >= 17) timeOfDay = "evening";

  const prompt = `You are a practical campus fashion advisor for Canadian university students.

CLASS CONTEXT:
- Class: ${classInfo.name}
- Time: ${classInfo.startTime} - ${classInfo.endTime} (${durationHours}h duration)
- Time of Day: ${timeOfDay}
- Location: ${classInfo.location || "Campus building"}

WEATHER CONDITIONS:
${weather ? `
- Condition: ${weather.condition}
- Temperature: ${weather.temp}°C
- Feels Like: ${weather.feelsLike}°C
- Wind Speed: ${weather.windSpeed} km/h
- Humidity: ${weather.humidity}%
` : "Weather data unavailable - assume typical campus conditions"}

TASK:
Generate a practical clothing recommendation considering:
1. **Campus Practicality**: Walking between buildings, sitting in lectures, indoor heating
2. **Canadian Winter Realities**: Wind chill, sudden weather changes, overheated classrooms
3. **Comfort vs. Style**: Balance looking good with staying comfortable for ${durationHours} hours
4. **Class Duration**: Longer classes need more comfort considerations

Return ONLY valid JSON matching this exact schema:
{
  "recommendation": "Brief outfit description (1-2 sentences)",
  "reasoning": "Why this outfit works for these conditions (1 sentence)",
  "accessories": ["Item 1", "Item 2"],
  "priority": "essential" or "suggested"
}

Rules:
- "essential" priority = weather requires specific protection (rain, extreme cold, etc.)
- "suggested" priority = general comfort recommendations
- Keep recommendations practical and campus-appropriate
- Focus on layering for indoor/outdoor transitions
- Accessories should be genuinely useful, not decorative`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON response
    const recommendation = JSON.parse(text) as AttireRecommendation;
    
    // Validate structure
    if (!recommendation.recommendation || !recommendation.reasoning || !recommendation.priority) {
      throw new Error("Invalid recommendation structure");
    }

    return recommendation;
  } catch (error) {
    console.error("Attire Recommendation Error:", error);
    
    // Fallback recommendation
    return {
      recommendation: weather 
        ? `Dress for ${weather.temp}°C with ${weather.condition.toLowerCase()} conditions.`
        : "Dress comfortably for typical campus conditions.",
      reasoning: "Unable to generate detailed recommendation.",
      accessories: [],
      priority: "suggested",
    };
  }
}

/**
 * Generate a simple text-based recommendation (fallback)
 */
export function getBasicAttireRecommendation(
  weather: HourlyForecast | null
): AttireRecommendation {
  if (!weather) {
    return {
      recommendation: "Dress in comfortable layers suitable for indoor campus environments.",
      reasoning: "Weather data unavailable.",
      accessories: [],
      priority: "suggested",
    };
  }

  const temp = weather.temp;
  const condition = weather.condition.toLowerCase();
  const windSpeed = weather.windSpeed;

  let recommendation = "";
  let accessories: string[] = [];
  let priority: "essential" | "suggested" = "suggested";

  // Temperature-based recommendations
  if (temp < 0) {
    recommendation = "Heavy winter coat, warm layers, insulated pants or thick jeans.";
    accessories = ["Winter hat", "Gloves", "Scarf"];
    priority = "essential";
  } else if (temp < 10) {
    recommendation = "Warm jacket, sweater or hoodie, long pants.";
    accessories = ["Light scarf or neck warmer"];
    priority = "suggested";
  } else if (temp < 20) {
    recommendation = "Light jacket or cardigan, comfortable layers.";
    accessories = [];
    priority = "suggested";
  } else {
    recommendation = "Light clothing, t-shirt or blouse, comfortable pants or shorts.";
    accessories = [];
    priority = "suggested";
  }

  // Weather condition adjustments
  if (condition.includes("rain") || condition.includes("drizzle")) {
    accessories.push("Umbrella", "Waterproof jacket");
    priority = "essential";
  } else if (condition.includes("snow")) {
    accessories.push("Waterproof boots", "Winter gloves");
    priority = "essential";
  }

  // Wind adjustments
  if (windSpeed > 20) {
    accessories.push("Windbreaker or wind-resistant layer");
    if (temp < 10) priority = "essential";
  }

  return {
    recommendation,
    reasoning: `Based on ${temp}°C temperature with ${condition} conditions.`,
    accessories: [...new Set(accessories)], // Remove duplicates
    priority,
  };
}
