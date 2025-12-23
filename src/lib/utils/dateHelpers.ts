import { Day } from "@/types";

/**
 * Resolve "today", "tomorrow", or specific day to Day enum
 * @param selectedDay - "today", "tomorrow", or day name like "MONDAY"
 * @returns Day enum value
 */
export function resolveAnalysisDay(selectedDay: string): Day {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const today = new Date();
  const todayIndex = today.getDay();

  if (selectedDay === "today") {
    return days[todayIndex] as Day;
  } else if (selectedDay === "tomorrow") {
    return days[(todayIndex + 1) % 7] as Day;
  } else {
    // Already a day name
    return selectedDay as Day;
  }
}

/**
 * Get ISO date string for the selected day
 * @param selectedDay - "today", "tomorrow", or day name like "MONDAY"
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getDateForAnalysisDay(selectedDay: string): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const today = new Date();
  const todayIndex = today.getDay();

  if (selectedDay === "today") {
    return today.toISOString().split("T")[0];
  } else if (selectedDay === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  } else {
    // It's a specific day name, find the next occurrence
    const targetDayIndex = days.indexOf(selectedDay.toUpperCase());
    if (targetDayIndex === -1) {
      // Fallback to today if invalid
      return today.toISOString().split("T")[0];
    }

    const daysUntilTarget = (targetDayIndex - todayIndex + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    return targetDate.toISOString().split("T")[0];
  }
}
