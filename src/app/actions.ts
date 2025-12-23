"use server";

import { prisma } from "@/lib/prisma";
import { parseSyllabus } from "@/lib/services/gemini";
import { getForecast, findClosestForecast } from "@/lib/services/weather";
import { assembleRecommendation } from "@/lib/services/commute";
import { CommuteMethod, Day } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Action: Create or Update User Profile
 */
export async function onboardUser(formData: {
  email: string;
  name: string;
  campusLocation: string;
  commuteMethod: CommuteMethod;
}) {
  const user = await prisma.user.upsert({
    where: { email: formData.email },
    update: {
      name: formData.name,
      campusLocation: formData.campusLocation,
      commuteMethod: formData.commuteMethod,
    },
    create: {
      email: formData.email,
      name: formData.name,
      campusLocation: formData.campusLocation,
      commuteMethod: formData.commuteMethod,
    },
  });

  revalidatePath("/");
  return user;
}

/**
 * Action: Parse Syllabus via Gemini
 */
export async function processSyllabus(base64Data: string, mimeType: string) {
  try {
    const classes = await parseSyllabus(base64Data, mimeType);
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Action: Save confirmed classes to Database
 */
export async function saveSchedule(userId: string, classes: any[]) {
  // Delete existing classes to avoid duplicates on re-upload
  await prisma.class.deleteMany({
    where: { userId },
  });

  const savedClasses = await Promise.all(
    classes.map((cls) =>
      prisma.class.create({
        data: {
          name: cls.name,
          startTime: cls.startTime,
          endTime: cls.endTime,
          days: cls.days as Day[],
          location: cls.location,
          userId,
        },
      })
    )
  );

  revalidatePath("/dashboard");
  return savedClasses;
}

/**
 * Action: Get the complete Dashboard Data for the next 48 hours
 */
export async function getDashboardData(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { classes: true },
  });

  if (!user) throw new Error("User not found");

  // For simplicity in this action, we'll find classes matching "Today"
  const today = new Date();
  const todayDay = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][today.getDay()] as Day;

  // 1. Filter classes for today
  const todaysClasses = user.classes.filter((cls) =>
    cls.days.includes(todayDay)
  );

  // 2. Mock coordinates for the university (in production, we'd lookup from our JSON)
  // For now, using a placeholder center point
  const universityLat = 43.6629; // Placeholder (UofT)
  const universityLng = -79.3957;

  // 3. Fetch Weather Forecast
  const weatherForecast = await getForecast(universityLat, universityLng);

  // 4. Build recommendations for each class
  const classSchedules = await Promise.all(
    todaysClasses.map(async (cls) => {
      // Find the specific weather for this class's startTime
      const [hours, minutes] = cls.startTime.split(":").map(Number);
      const classDate = new Date();
      classDate.setHours(hours, minutes, 0, 0);

      const weather = findClosestForecast(weatherForecast, classDate);
      
      // Calculate Recommendation (Mocking origin as "CN Tower" for now)
      const recommendation = await assembleRecommendation(
        "43.6426,-79.3871", // Mock User Home
        `${universityLat},${universityLng}`,
        user.commuteMethod,
        weather
      );

      return {
        ...cls,
        weather,
        recommendation,
      };
    })
  );

  return {
    user,
    classSchedules,
  };
}
