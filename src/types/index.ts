export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface ParsedClass {
  name: string;
  startTime: string;
  endTime: string;
  days?: Day[];
  location?: string;
}
