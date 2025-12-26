import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeatherForecast } from '@/lib/services/weather';

// Mock the AI Config Service
vi.mock('@/lib/services/ai-config', () => ({
  default: {
    isMaintenanceMode: vi.fn().mockResolvedValue(false),
    incrementWeatherUsage: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('weather service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeatherForecast (dummy mode)', () => {
    it('should return weather data', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      expect(result).toBeDefined();
      expect(result.date).toBe('2025-12-26');
      expect(result.hourlyForecasts).toBeDefined();
      expect(result.hourlyForecasts.length).toBeGreaterThan(0);
    });

    it('should include location coordinates in response', async () => {
      const lat = 43.6532;
      const lng = -79.3832;
      
      const result = await getWeatherForecast(lat, lng, '2025-12-26');

      expect(result.location).toBeDefined();
      expect(typeof result.location).toBe('string');
    });

    it('should return 24 hourly forecasts', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      expect(result.hourlyForecasts).toHaveLength(24);
    });

    it('should have valid forecast data structure', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      const forecast = result.hourlyForecasts[0];
      expect(forecast).toHaveProperty('hour');
      expect(forecast).toHaveProperty('temp');
      expect(forecast).toHaveProperty('feelsLike');
      expect(forecast).toHaveProperty('condition');
      expect(forecast).toHaveProperty('windSpeed');
      expect(forecast).toHaveProperty('humidity');
    });

    it('should handle different dates', async () => {
      const dates = ['2025-12-26', '2025-12-27', '2025-12-28'];

      for (const date of dates) {
        const result = await getWeatherForecast(43.6532, -79.3832, date);
        expect(result.date).toBe(date);
      }
    });
  });

  describe('maintenance mode', () => {
    it('should return data when maintenance mode is active', async () => {
      const AIConfigService = (await import('@/lib/services/ai-config')).default;
      vi.mocked(AIConfigService.isMaintenanceMode).mockResolvedValueOnce(true);

      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      expect(result).toBeDefined();
      expect(result.hourlyForecasts).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle coordinates at extremes', async () => {
      const extremeCoords = [
        { lat: 90, lng: 180 },    // North Pole
        { lat: -90, lng: -180 },  // South Pole
        { lat: 0, lng: 0 },       // Null Island
      ];

      for (const { lat, lng } of extremeCoords) {
        const result = await getWeatherForecast(lat, lng, '2025-12-26');
        expect(result).toBeDefined();
      }
    });

    it('should handle future dates', async () => {
      const futureDate = '2026-01-01';
      const result = await getWeatherForecast(43.6532, -79.3832, futureDate);

      expect(result.date).toBe(futureDate);
    });

    it('should handle past dates', async () => {
      const pastDate = '2024-01-01';
      const result = await getWeatherForecast(43.6532, -79.3832, pastDate);

      expect(result.date).toBe(pastDate);
    });
  });

  describe('data validation', () => {
    it('should return valid temperature ranges', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      result.hourlyForecasts.forEach(forecast => {
        expect(forecast.temp).toBeGreaterThan(-100);
        expect(forecast.temp).toBeLessThan(100);
        expect(forecast.feelsLike).toBeGreaterThan(-100);
        expect(forecast.feelsLike).toBeLessThan(100);
      });
    });

    it('should return valid humidity ranges (0-100)', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      result.hourlyForecasts.forEach(forecast => {
        expect(forecast.humidity).toBeGreaterThanOrEqual(0);
        expect(forecast.humidity).toBeLessThanOrEqual(100);
      });
    });

    it('should return valid wind speeds', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      result.hourlyForecasts.forEach(forecast => {
        expect(forecast.windSpeed).toBeGreaterThanOrEqual(0);
        expect(forecast.windSpeed).toBeLessThan(500);
      });
    });

    it('should return valid hour format (HH:mm)', async () => {
      const result = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      result.hourlyForecasts.forEach(forecast => {
        expect(forecast.hour).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    it('should return consistent data for same inputs', async () => {
      const result1 = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');
      const result2 = await getWeatherForecast(43.6532, -79.3832, '2025-12-26');

      expect(result1.date).toBe(result2.date);
      expect(result1.hourlyForecasts.length).toBe(result2.hourlyForecasts.length);
    });
  });

  describe('performance', () => {
    it('should return data quickly', async () => {
      const startTime = Date.now();
      
      await getWeatherForecast(43.6532, -79.3832, '2025-12-26');
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});

