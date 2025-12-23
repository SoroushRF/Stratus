# Phase 3 Task 3.1 - Weather Service Architecture

## Overview

Created a clean, modular weather service architecture that supports easy swapping between dummy data (for testing) and live API calls (for production).

## File Structure

### 1. Type Definitions (`src/types/index.ts`)

- `HourlyForecast`: Individual hourly weather data point
- `WeatherData`: Complete weather data for a location/date

### 2. Weather Service (`src/lib/services/weather.ts`)

**Strategy Pattern Implementation:**

- `WeatherService` interface: Defines contract for weather data fetching
- `DummyWeatherService`: Returns pre-written test data
- `OpenWeatherService`: Placeholder for live API (to be implemented)
- `USE_DUMMY_DATA` flag: Toggle between dummy/live data

**Key Function:**

- `getWeatherForecast(lat, lng, date)`: Main entry point for fetching weather

### 3. Weather Matcher (`src/lib/utils/weatherMatcher.ts`)

**Temporal Matching Logic:**

- `findNearestForecast()`: Matches class start time to closest hourly forecast
- `matchClassesToWeather()`: Pairs all classes with their weather data
- `filterClassesByDay()`: Filters classes for specific day

### 4. Date Helpers (`src/lib/utils/dateHelpers.ts`)

**Day Resolution:**

- `resolveAnalysisDay()`: Converts "today"/"tomorrow" → Day enum
- `getDateForAnalysisDay()`: Converts selected day → ISO date string

### 5. Dummy Data (`src/lib/data/dummyWeather.ts`)

**Test Data Storage:**

- Placeholder for pre-written weather forecasts
- Ready to be populated with realistic test scenarios

## Usage Flow

```typescript
// 1. User selects campus and day
const university = universities.find((u) => u.name === selectedUniName);
const analysisDate = getDateForAnalysisDay(selectedDay);
const actualDay = resolveAnalysisDay(selectedDay);

// 2. Fetch weather for that location/date
const weatherData = await getWeatherForecast(
  university.lat,
  university.lng,
  analysisDate
);

// 3. Filter classes for the selected day
const dayClasses = filterClassesByDay(classes, actualDay);

// 4. Match classes to weather
const matches = matchClassesToWeather(dayClasses, weatherData);

// 5. Each match contains:
// { class: ParsedClass, weather: HourlyForecast | null }
```

## Migration Path to Live API

**When ready for production:**

1. Set `USE_DUMMY_DATA = false` in `weather.ts`
2. Add `OPENWEATHER_API_KEY` to `.env`
3. Implement `OpenWeatherService.getHourlyForecast()`
4. No other code changes needed!

## Next Steps (Part 2)

- Design and populate `dummyWeather.ts` with realistic test data
- Cover various scenarios: Clear, Rain, Snow, Wind
- Include typical class hours (06:00 - 22:00)
