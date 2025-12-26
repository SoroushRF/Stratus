import { GoogleGenerativeAI } from "@google/generative-ai";
import { Day, ParsedClass } from "@/types";
import AIConfigService from "./ai-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const extractSchedule = async (
  base64Data: string,
  mimeType: string
): Promise<ParsedClass[]> => {
  const startTime = Date.now();
  const slug = 'schedule-parser';
  
  // 1. Check Maintenance Mode
  if (await AIConfigService.isMaintenanceMode()) {
    throw new Error("System is currently under maintenance. Please try again later.");
  }

  const modelName = await AIConfigService.getModel(slug);
  const prompt = await AIConfigService.getPrompt(slug);

  const model = genAI.getGenerativeModel({ model: modelName });

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
    const usage = result.response.usageMetadata;
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const classes = jsonMatch ? (JSON.parse(jsonMatch[0]) as ParsedClass[]) : [];

    await AIConfigService.logExecution({
      slug,
      inputType: mimeType,
      rawOutput: text,
      status: 'success',
      latencyMs: Date.now() - startTime,
      modelUsed: modelName,
      prompt_tokens: usage?.promptTokenCount,
      completion_tokens: usage?.candidatesTokenCount
    });

    return classes;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    
    await AIConfigService.logExecution({
      slug,
      inputType: mimeType,
      status: 'failure',
      errorMessage: (error as Error).message,
      latencyMs: Date.now() - startTime,
      modelUsed: modelName
    });

    throw new Error(
      (error as Error).message.includes("maintenance") 
        ? (error as Error).message 
        : "Failed to parse schedule data. Please check your API key and file."
    );
  }
};
