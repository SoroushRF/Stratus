import { ParsedClass, HourlyForecast, WeatherData, Day } from '@/types';

// =====================================================
// MOCK CLASSES
// =====================================================

export const mockClass1: ParsedClass = {
  name: 'Computer Science 101',
  startTime: '09:00',
  endTime: '10:30',
  days: [Day.MONDAY, Day.WEDNESDAY, Day.FRIDAY],
  location: 'BA 1234',
};

export const mockClass2: ParsedClass = {
  name: 'Mathematics 201',
  startTime: '14:00',
  endTime: '15:30',
  days: [Day.TUESDAY, Day.THURSDAY],
  location: 'MP 202',
};

export const mockClass3: ParsedClass = {
  name: 'Physics 301',
  startTime: '18:00',
  endTime: '20:00',
  days: [Day.MONDAY],
  location: 'MP 134',
};

export const mockClasses: ParsedClass[] = [mockClass1, mockClass2, mockClass3];

// =====================================================
// MOCK WEATHER DATA
// =====================================================

export const mockHourlyForecast9AM: HourlyForecast = {
  hour: '09:00',
  temp: 5,
  feelsLike: 2,
  condition: 'Partly Cloudy',
  windSpeed: 15,
  humidity: 65,
};

export const mockHourlyForecast2PM: HourlyForecast = {
  hour: '14:00',
  temp: 8,
  feelsLike: 6,
  condition: 'Clear',
  windSpeed: 10,
  humidity: 55,
};

export const mockHourlyForecast6PM: HourlyForecast = {
  hour: '18:00',
  temp: 3,
  feelsLike: -1,
  condition: 'Light Snow',
  windSpeed: 20,
  humidity: 75,
};

export const mockWeatherData: WeatherData = {
  location: 'University of Toronto - St. George',
  date: '2025-12-26',
  hourlyForecasts: [
    mockHourlyForecast9AM,
    { hour: '10:00', temp: 6, feelsLike: 3, condition: 'Partly Cloudy', windSpeed: 12, humidity: 60 },
    { hour: '11:00', temp: 7, feelsLike: 4, condition: 'Cloudy', windSpeed: 11, humidity: 58 },
    { hour: '12:00', temp: 7, feelsLike: 5, condition: 'Cloudy', windSpeed: 10, humidity: 56 },
    { hour: '13:00', temp: 8, feelsLike: 6, condition: 'Partly Cloudy', windSpeed: 9, humidity: 54 },
    mockHourlyForecast2PM,
    { hour: '15:00', temp: 7, feelsLike: 5, condition: 'Clear', windSpeed: 11, humidity: 57 },
    { hour: '16:00', temp: 6, feelsLike: 3, condition: 'Clear', windSpeed: 13, humidity: 60 },
    { hour: '17:00', temp: 4, feelsLike: 1, condition: 'Partly Cloudy', windSpeed: 16, humidity: 68 },
    mockHourlyForecast6PM,
    { hour: '19:00', temp: 2, feelsLike: -2, condition: 'Snow', windSpeed: 22, humidity: 80 },
    { hour: '20:00', temp: 1, feelsLike: -3, condition: 'Snow', windSpeed: 23, humidity: 82 },
  ],
};

// =====================================================
// MOCK GEMINI RESPONSES
// =====================================================

export const mockGeminiScheduleResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify([
              {
                name: 'Computer Science 101',
                startTime: '09:00',
                endTime: '10:30',
                days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
                location: 'BA 1234',
              },
            ]),
          },
        ],
      },
    },
  ],
  usageMetadata: {
    promptTokenCount: 150,
    candidatesTokenCount: 75,
  },
};

export const mockGeminiAttireResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              recommendation: 'Warm winter jacket with layers',
              reasoning: 'Temperature is below freezing with wind chill',
              accessories: ['Gloves', 'Scarf', 'Winter hat'],
              priority: 'essential',
            }),
          },
        ],
      },
    },
  ],
  usageMetadata: {
    promptTokenCount: 200,
    candidatesTokenCount: 100,
  },
};

// =====================================================
// MOCK TOMORROW.IO RESPONSES
// =====================================================

export const mockTomorrowResponse = {
  data: {
    timelines: [
      {
        intervals: [
          {
            startTime: '2025-12-26T09:00:00Z',
            values: {
              temperature: 5,
              temperatureApparent: 2,
              weatherCode: 1100, // Mostly Clear
              windSpeed: 15,
              humidity: 65,
            },
          },
          {
            startTime: '2025-12-26T14:00:00Z',
            values: {
              temperature: 8,
              temperatureApparent: 6,
              weatherCode: 1000, // Clear
              windSpeed: 10,
              humidity: 55,
            },
          },
        ],
      },
    ],
  },
};
