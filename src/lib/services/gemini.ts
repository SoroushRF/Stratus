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
export const extractSchedule = async (
  base64Data: string,
  mimeType: string
): Promise<ParsedClass[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    You are a high-accuracy schedule parsing agent. Your task is to analyze the provided image or PDF of a student's weekly class schedule and extract all recurring classes.

    STRICT RULES:
    1. EXTRACION: Look for course names, time blocks (start/end), days of the week, and locations.
    2. TIME CONVERSION: Convert all times to 24-hour format "HH:mm" (e.g., 9:00 AM -> 09:00, 2:30 PM -> 14:30).
    3. DAY NORMALIZATION: Map abbreviations to full names:
       - M, Mon -> MONDAY
       - T, Tue, Tu -> TUESDAY
       - W, Wed -> WEDNESDAY
       - R, Thu, Th -> THURSDAY
       - F, Fri -> FRIDAY
       - S, Sat -> SATURDAY
       - U, Sun -> SUNDAY
    4. GRID LAYOUTS: If the schedule is in a grid/table, look at the row (time) and column (day) headers to determine the class timing.
    5. RELIABILITY: Only include items that are clearly identifiable as classes. If a course has different times on different days, create separate objects or list all days in the same object if times match.

    Return ONLY a valid JSON array of objects with this schema:
    [{
      "name": string,
      "startTime": string,
      "endTime": string,
      "days": ["MONDAY", "TUESDAY", ...],
      "location": string
    }]

    If no recurring classes or schedule data is detected, return an empty array [].
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
    throw new Error("Failed to parse schedule data.");
  }
};
