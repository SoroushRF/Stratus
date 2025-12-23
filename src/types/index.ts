export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  campusLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: Day[];
  location: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherLog {
  id: string;
  temp: number;
  condition: string;
  precipChance: number;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend specific types for the UI
export interface WeatherForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
  description: string;
}

export interface ClothingPlan {
  outerwear: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
  rationale: string;
}

export interface Recommendation {
  clothingPlan: ClothingPlan;
  tools: string[];
  advice: string;
}

export interface DailySchedule {
  date: string;
  classes: (Class & { weather: WeatherForecast; attire?: ClothingPlan })[];
  recommendation: Recommendation;
}
