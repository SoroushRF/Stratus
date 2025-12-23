export enum CommuteMethod {

  WALKING = "WALKING",
  DRIVING = "DRIVING",
  BIKING = "BIKING",
  TRANSIT = "TRANSIT",

}

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
  homeLocation?: string | null;
  commuteMethod: CommuteMethod;
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

export interface CommuteAdvice {
    method: CommuteMethod;
    estimatedTime: number; // in minutes
    clothingRecommendation: string;
    warning?: string;
}

// Frontend specific types for the UI
export interface WeatherForecast {
    time: string;
    temp: number;
    condition: string;
    icon: string;
    description: string;
}

export interface Recommendation {
    clothing: string[];
    tools: string[];
    commuteMethod: "Walking" | "Biking" | "Driving" | "Transit" | CommuteMethod;
    commuteAdvice: string;
}

export interface DailySchedule {
    date: string;
    classes: Class[];
    weather: WeatherForecast[];
    recommendation: Recommendation;
}
