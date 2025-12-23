import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedClass, HourlyForecast, AttireRecommendation, MasterRecommendation, ClassAttireRecommendation } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate clothing recommendation for a single class based on weather
 */
export async function generateAttireRecommendation(
  classInfo: ParsedClass,
  weather: HourlyForecast | null
): Promise<AttireRecommendation> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
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
    
    console.log("Gemini Response:", text); // Debug log
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", text);
      throw new Error("No JSON found in response");
    }
    
    // Parse JSON response
    const recommendation = JSON.parse(jsonMatch[0]) as AttireRecommendation;
    
    // Validate structure
    if (!recommendation.recommendation || !recommendation.reasoning || !recommendation.priority) {
      console.error("Invalid recommendation structure:", recommendation);
      throw new Error("Invalid recommendation structure");
    }

    console.log("Successfully generated recommendation:", recommendation); // Debug log
    return recommendation;
  } catch (error) {
    console.error("Attire Recommendation Error Details:", {
      error,
      className: classInfo.name,
      weather: weather ? `${weather.temp}°C, ${weather.condition}` : "null"
    });
    
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

/**
 * Generate a master recommendation for the entire day
 * Analyzes all class recommendations and creates one outfit that works for everything
 */
export async function generateMasterRecommendation(
  recommendations: ClassAttireRecommendation[]
): Promise<MasterRecommendation> {
  if (recommendations.length === 0) {
    return {
      baseOutfit: "Comfortable campus attire",
      layeringStrategy: "No classes scheduled",
      essentialAccessories: [],
      reasoning: "No classes to analyze",
      weatherRange: { minTemp: 0, maxTemp: 0, conditions: [] },
    };
  }

  // Analyze weather conditions across all classes
  const temps = recommendations
    .filter(r => r.weather)
    .map(r => r.weather!.temp);
  const feelsLike = recommendations
    .filter(r => r.weather)
    .map(r => r.weather!.feelsLike);
  const conditions = [...new Set(
    recommendations
      .filter(r => r.weather)
      .map(r => r.weather!.condition)
  )];
  const windSpeeds = recommendations
    .filter(r => r.weather)
    .map(r => r.weather!.windSpeed);

  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
  const minFeelsLike = feelsLike.length > 0 ? Math.min(...feelsLike) : minTemp;
  const maxWind = windSpeeds.length > 0 ? Math.max(...windSpeeds) : 0;

  // Collect all accessories from individual recommendations
  const allAccessories = recommendations
    .flatMap(r => r.attire.accessories)
    .filter((item, index, self) => self.indexOf(item) === index); // Unique

  // Check if any recommendation is "essential"
  const hasEssential = recommendations.some(r => r.attire.priority === "essential");

  // Get time range
  const startTimes = recommendations.map(r => r.class.startTime);
  const endTimes = recommendations.map(r => r.class.endTime);
  const earliestClass = startTimes.sort()[0];
  const latestClass = endTimes.sort().reverse()[0];

  // Build context for AI
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
  });

  const prompt = `You are a practical campus fashion advisor creating a MASTER outfit recommendation for an entire day.

DAILY CONTEXT:
- Number of classes: ${recommendations.length}
- Time span: ${earliestClass} to ${latestClass}
- Temperature range: ${minTemp}°C to ${maxTemp}°C (feels like ${minFeelsLike}°C at coldest)
- Weather conditions: ${conditions.join(", ")}
- Max wind speed: ${maxWind} km/h

INDIVIDUAL CLASS RECOMMENDATIONS:
${recommendations.map((r, i) => `
${i + 1}. ${r.class.name} (${r.class.startTime})
   - Weather: ${r.weather ? `${r.weather.temp}°C, ${r.weather.condition}` : "N/A"}
   - Recommendation: ${r.attire.recommendation}
   - Accessories: ${r.attire.accessories.join(", ") || "None"}
`).join("")}

TASK:
Create ONE master outfit that works for ALL classes. Focus on:
1. **Layering Strategy**: How to adjust for temperature changes (${minTemp}°C → ${maxTemp}°C)
2. **Worst-Case Protection**: Handle the coldest/windiest/wettest conditions
3. **Indoor Comfort**: Account for overheated classrooms
4. **Campus Practicality**: Easy to adjust between classes

Return ONLY valid JSON matching this exact schema:
{
  "baseOutfit": "Core outfit description (jacket, pants, shoes)",
  "layeringStrategy": "How to adjust throughout the day (what to add/remove when)",
  "essentialAccessories": ["Item 1", "Item 2"],
  "reasoning": "Why this outfit works for the entire day (1-2 sentences)"
}

Rules:
- Base outfit should handle the worst conditions
- Layering strategy should explain when to add/remove layers
- Essential accessories are items you MUST bring
- Keep it practical and campus-appropriate`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("Master Recommendation Response:", text); // Debug log
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in master recommendation response:", text);
      throw new Error("No JSON found in response");
    }
    
    const masterRec = JSON.parse(jsonMatch[0]);
    
    return {
      baseOutfit: masterRec.baseOutfit || "Layered campus attire",
      layeringStrategy: masterRec.layeringStrategy || "Adjust layers as needed",
      essentialAccessories: masterRec.essentialAccessories || allAccessories,
      reasoning: masterRec.reasoning || `Outfit designed for ${minTemp}°C to ${maxTemp}°C range`,
      weatherRange: {
        minTemp,
        maxTemp,
        conditions,
      },
    };
  } catch (error) {
    console.error("Master Recommendation Error:", error);
    
    // Fallback: rule-based master recommendation
    let baseOutfit = "";
    let layeringStrategy = "";
    
    if (minTemp < 0) {
      baseOutfit = "Heavy winter coat, warm sweater, insulated pants, winter boots";
      layeringStrategy = maxTemp > 10 
        ? "Remove coat indoors, keep sweater. Add coat back for outdoor transitions."
        : "Keep all layers throughout the day";
    } else if (minTemp < 10) {
      baseOutfit = "Warm jacket, hoodie or sweater (removable), jeans, comfortable shoes";
      layeringStrategy = maxTemp > 15
        ? "Start with jacket, remove for afternoon warmth. Keep hoodie for indoor comfort."
        : "Wear jacket throughout, remove indoors if needed";
    } else {
      baseOutfit = "Light jacket or cardigan, t-shirt, comfortable pants";
      layeringStrategy = "Jacket optional, mainly for air-conditioned buildings";
    }

    return {
      baseOutfit,
      layeringStrategy,
      essentialAccessories: allAccessories,
      reasoning: `Designed for temperature range ${minTemp}°C to ${maxTemp}°C with ${conditions.join(", ").toLowerCase()} conditions`,
      weatherRange: {
        minTemp,
        maxTemp,
        conditions,
      },
    };
  }
}
