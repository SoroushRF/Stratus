import { GoogleGenerativeAI } from "@google/generative-ai";
import { Day } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ParsedClass {
  name: string;
  startTime: string; // 24h format "HH:mm"
  endTime: string;
  days: Day[];
  location: string;
}

/**
 * Uses Gemini to parse class schedule information from a document (PDF or Image).
 * Returns a JSON array of classes.
 */
export const parseSyllabus = async (
  base64Data: string,
  mimeType: string
): Promise<ParsedClass[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    Analyze this syllabus or class schedule. Extract all recurring classes.
    For each class, identify:
    1. The name of the course.
    2. The start and end times (convert to 24-hour format like "14:30").
    3. The days of the week (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY).
    4. The physical location (building and room number).

    Return ONLY a valid JSON array of objects with the following schema:
    [{
      "name": string,
      "startTime": string,
      "endTime": string,
      "days": ["MONDAY", "TUESDAY", ...],
      "location": string
    }]

    If no schedule is found, return an empty array [].
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
    // Use regex to extract JSON if Gemini includes markdown code blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as ParsedClass[];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse syllabus data.");
  }
};
