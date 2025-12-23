import { GoogleGenerativeAI } from "@google/generative-ai";
import { Day } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const parseSyllabus = async (fileBuffer: Buffer) => {
  // Logic to send to Gemini for parsing
  // Return typed syllabus data
  console.log("Parsing syllabus...");
  return []; 
};
