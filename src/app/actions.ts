"use server";

import { prisma } from "@/lib/prisma";
import { parseSyllabus } from "@/lib/services/gemini";
import { getForecast, findClosestForecast } from "@/lib/services/weather";
import { assembleRecommendation } from "@/lib/services/commute";
import { CommuteMethod, Day, Class } from "@/types";
import { revalidatePath } from "next/cache";
import universities from "@/lib/data/universities.json";

/**
 * Action: Create or Update User Profile
 */
export async function onboardUser(formData: {
  email: string;
  name: string;
  campusLocation: string;
  homeLocation: string;
  commuteMethod: CommuteMethod;
}) {
  console.log("Onboarding user:", formData.email);
  const user = await prisma.user.upsert({
    where: { email: formData.email },
    update: {
      name: formData.name,
      campusLocation: formData.campusLocation,
      homeLocation: formData.homeLocation,
      commuteMethod: formData.commuteMethod as any,
    },
    create: {
      email: formData.email,
      name: formData.name,
      campusLocation: formData.campusLocation,
      homeLocation: formData.homeLocation,
      commuteMethod: formData.commuteMethod as any,
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
  console.log("Saving schedule for user:", userId);
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
          days: Array.isArray(cls.days) ? cls.days.join(",") : String(cls.days), 
          location: cls.location,
          userId,
        } as any,
      })
    )
  );

  revalidatePath("/dashboard");
  return savedClasses;
}

/**
 * Action: Get the complete Dashboard Data for the next 48 hours
 */
export async function getDashboardData(email: string) {
  console.log("Fetching dashboard data for:", email);
  try {
    // 1. Fetch User and their today's schedule
    let user = await prisma.user.findUnique({
      where: { email },
      include: { classes: true },
    }) as any;

    const today = new Date();
    const dayIndex = today.getDay();
    const todayDayName = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][dayIndex];

    // Failsafe for testing/demo: create a test user if missing
    if (!user && email === "test@example.com") {
      console.log("Creating test user...");
      user = await prisma.user.create({
          data: {
              email: "test@example.com",
              name: "Test Student",
              campusLocation: "University of Toronto",
              homeLocation: "CN Tower, Toronto",
              commuteMethod: "TRANSIT" as any,
              classes: {
                  create: [
                      { name: "Advanced Computer Science", startTime: "09:00", endTime: "10:30", location: "Hall A - Room 302", days: todayDayName } as any,
                      { name: "Environmental Science", startTime: "11:00", endTime: "12:30", location: "Green Lab - Bld 4", days: todayDayName } as any
                  ]
              }
          },
          include: { classes: true }
      }) as any;
    }

    if (!user) {
      console.error("User not found for email:", email);
      throw new Error("User not found");
    }

    // 1. Map database classes back to UI Class type (splitting days)
    const mappedClasses: Class[] = (user.classes || []).map((cls: any) => ({
      ...cls,
      days: (cls.days || "").split(",").filter(Boolean) as Day[]
    }));

    // 2. Filter classes for today
    const todaysClasses = mappedClasses.filter((cls) =>
      cls.days.includes(todayDayName as Day)
    );

    console.log(`Found ${todaysClasses.length} classes for today (${todayDayName})`);

    // 3. Lookup university coordinates from our JSON database
    const university = universities.find(u => u.name === user!.campusLocation);
    
    const universityLat = university?.lat || 43.6629; // Fallback to UofT if not found
    const universityLng = university?.lng || -79.3957;

    // 4. Fetch Weather Forecast
    const weatherForecast = await getForecast(universityLat, universityLng);

    // 5. Build recommendations for each class
    const classSchedules = await Promise.all(
      todaysClasses.map(async (cls) => {
        // Find the specific weather for this class's startTime
        const [hours, minutes] = cls.startTime.split(":").map(Number);
        const classDate = new Date();
        classDate.setHours(hours, minutes, 0, 0);

        const weather = findClosestForecast(weatherForecast, classDate);
        
        // 5. Calculate Recommendation
        const recommendation = await assembleRecommendation(
          user!.homeLocation || "Toronto, ON", // Use saved home or fallback
          `${universityLat},${universityLng}`,
          user!.commuteMethod as CommuteMethod,
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
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    throw error;
  }
}
