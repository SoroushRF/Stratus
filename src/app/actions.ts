"use server";

import { extractSchedule } from "@/lib/services/gemini";

export async function processSchedule(base64Data: string, mimeType: string) {
  try {
    const classes = await extractSchedule(base64Data, mimeType);
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
