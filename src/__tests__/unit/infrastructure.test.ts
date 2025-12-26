import { describe, it, expect } from 'vitest';

describe('Test Infrastructure', () => {
  it('should run basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should have access to environment variables', () => {
    expect(process.env.GEMINI_API_KEY).toBe('test-gemini-key');
    expect(process.env.TOMORROW_API_KEY).toBe('test-tomorrow-key');
  });

  it('should import mock data correctly', async () => {
    const { mockClass1, mockWeatherData } = await import('../mockData');
    
    expect(mockClass1).toBeDefined();
    expect(mockClass1.name).toBe('Computer Science 101');
    
    expect(mockWeatherData).toBeDefined();
    expect(mockWeatherData.hourlyForecasts).toHaveLength(12);
  });
});
