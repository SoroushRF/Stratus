import { GoogleGenerativeAI } from "@google/generative-ai";
import { Day, ParsedClass } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const extractSchedule = async (
  base64Data: string,
  mimeType: string
): Promise<ParsedClass[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    Analyze the provided image, PDF, or text file of a schedule and extract the classes.
    
    Return a JSON array of objects with this schema:
    [{
      "name": "Class Name",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "days": ["MONDAY", "TUESDAY"],
      "location": "Optional Location"
    }]

    Strict Rules:
    1. Convert all times to 24-hour HH:mm format.
    2. Normalize days to: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY.
    3. If no specific days are found, omit the "days" field.
    4. If the schedule is just a list of events with times, extract them regardless of weekly repetition.
    5. Return ONLY the JSON array.
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]) as ParsedClass[];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse schedule data. Please check your API key and file.");
  }
};
