"use server";

import { prisma } from "@/lib/prisma";
import { extractSchedule } from "@/lib/services/gemini";
import { getForecast, findClosestForecast } from "@/lib/services/weather";
import { generateAttirePlan } from "@/lib/services/attire";
import { Day, Class } from "@/types";
import { revalidatePath } from "next/cache";
import universities from "@/lib/data/universities.json";

/**
 * Action: Create or Update User Profile
 */
export async function onboardUser(formData: {
  email: string;
  name: string;
  campusLocation: string;
}) {
  console.log("Onboarding user:", formData.email);
  const user = await prisma.user.upsert({
    where: { email: formData.email },
    update: {
      name: formData.name,
      campusLocation: formData.campusLocation,
    },
    create: {
      email: formData.email,
      name: formData.name,
      campusLocation: formData.campusLocation,
    },
  });

  revalidatePath("/");
  return user;
}

/**
 * Action: Parse Schedule via Gemini
 */
export async function processSchedule(base64Data: string, mimeType: string) {
  try {
    const classes = await extractSchedule(base64Data, mimeType);
    return { success: true, data: classes };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Action: Save confirmed classes to Database
 */
export async function saveSchedule(userId: string, classes: Omit<Class, "id" | "userId" | "createdAt" | "updatedAt">[]) {
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
export async function getDashboardData(email: string) {
  console.log("Fetching dashboard data for:", email);
  try {
    // 1. Fetch User and their today's schedule
    const user = await prisma.user.findUnique({
      where: { email },
      include: { classes: true },
    });

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
      await prisma.user.create({
          data: {
              email: "test@example.com",
              name: "Test Student",
              campusLocation: "University of Toronto",
              classes: {
                  create: [
                      { name: "Advanced Computer Science", startTime: "09:00", endTime: "10:30", location: "Hall A - Room 302", days: todayDayName },
                      { name: "Environmental Science", startTime: "11:00", endTime: "12:30", location: "Green Lab - Bld 4", days: todayDayName }
                  ]
              }
          }
      });
      // Re-fetch to get the include
      const newUser = await prisma.user.findUnique({
        where: { email: "test@example.com" },
        include: { classes: true }
      });
      if (!newUser) throw new Error("Failed to create test user");
      return getDashboardDataFromUser(newUser, todayDayName);
    }

    if (!user) {
      console.error("User not found for email:", email);
      throw new Error("User not found");
    }

    return getDashboardDataFromUser(user, todayDayName);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    throw error;
  }
}

async function getDashboardDataFromUser(
  user: { classes: unknown[]; campusLocation: string },
  todayDayName: string
) {
  // 1. Map database classes back to UI Class type (splitting days)
  const mappedClasses: Class[] = (user.classes || []).map((cls) => {
    const c = cls as Record<string, unknown>;
    return {
      ...c,
      days: (c.days as string || "").split(",").filter(Boolean) as Day[],
    } as unknown as Class;
  });

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
    let weatherForecast;
    try {
      weatherForecast = await getForecast(universityLat, universityLng);
    } catch {
      console.warn("Weather API failed, using mock data.");
      weatherForecast = Array.from({ length: 48 }).map((_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        temp: 18 + Math.sin(i / 4) * 5,
        condition: "Clear",
        icon: "01d",
        description: "Clear sky"
      }));
    }

    // 5. Package schedules with weather and AI attire
    const classSchedules = await Promise.all(todaysClasses.map(async (cls) => {
      const [hours, minutes] = cls.startTime.split(":").map(Number);
      const classDate = new Date();
      classDate.setHours(hours, minutes, 0, 0);

      const weather = findClosestForecast(weatherForecast, classDate);
      
      let attire;
      try {
        attire = await generateAttirePlan(weather, cls.name, cls.startTime);
      } catch {
        attire = {
          outerwear: "Light transition jacket",
          top: "Cotton layer",
          bottom: "Daily denim",
          footwear: "Neutral sneakers",
          accessories: ["Power bank", "Campus ID"],
          rationale: "Optimized for indoor-outdoor campus shifts."
        };
      }
      
      return {
        ...cls,
        weather,
        attire
      };
    }));

    // 6. Create Master Recommendation (Top of Dashboard)
    const recommendation = classSchedules.length > 0 ? {
      clothingPlan: classSchedules[0].attire,
      tools: classSchedules[0].attire.accessories,
      advice: classSchedules[0].attire.rationale
    } : null;

    return {
      user,
      classSchedules,
      recommendation,
    };
}
