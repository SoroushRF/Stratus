import { ParsedClass, Day } from "@/types";

/**
 * Convert "today" or "tomorrow" to actual day name
 * @param selectedDay - The day value from the selector
 * @returns Day enum value (e.g., "MONDAY", "TUESDAY")
 */
export function resolveAnalysisDay(selectedDay: string): Day {
  const days: Day[] = [
    Day.SUNDAY,
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
    Day.SATURDAY,
  ];

  const today = new Date();
  const todayIndex = today.getDay();

  if (selectedDay === "today") {
    return days[todayIndex];
  }

  if (selectedDay === "tomorrow") {
    const tomorrowIndex = (todayIndex + 1) % 7;
    return days[tomorrowIndex];
  }

  // Already a day name (e.g., "MONDAY")
  return selectedDay as Day;
}

/**
 * Get the date string for the selected analysis day
 * @param selectedDay - The day value from the selector
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getDateForAnalysisDay(selectedDay: string): string {
  const today = new Date();
  const todayIndex = today.getDay();

  let daysToAdd = 0;

  if (selectedDay === "today") {
    daysToAdd = 0;
  } else if (selectedDay === "tomorrow") {
    daysToAdd = 1;
  } else {
    // Calculate days until the selected day
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const targetIndex = days.indexOf(selectedDay);
    
    if (targetIndex === -1) {
      // Invalid day, default to today
      daysToAdd = 0;
    } else {
      // Calculate forward distance
      daysToAdd = (targetIndex - todayIndex + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // If same day, go to next week
    }
  }

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);

  // Return ISO date string (YYYY-MM-DD)
  return targetDate.toISOString().split("T")[0];
}
