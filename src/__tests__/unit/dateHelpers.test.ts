import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveAnalysisDay, getDateForAnalysisDay } from '@/lib/utils/dateHelpers';
import { Day } from '@/types';

describe('dateHelpers', () => {
  describe('resolveAnalysisDay', () => {
    beforeEach(() => {
      // Mock Date to be consistent (Monday, December 23, 2024)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-12-23T10:00:00Z')); // Monday
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should resolve "today" to current day (MONDAY)', () => {
      const result = resolveAnalysisDay('today');
      expect(result).toBe('MONDAY');
    });

    it('should resolve "tomorrow" to next day (TUESDAY)', () => {
      const result = resolveAnalysisDay('tomorrow');
      expect(result).toBe('TUESDAY');
    });

    it('should handle week wraparound (Sunday -> Monday)', () => {
      // Set to Sunday
      vi.setSystemTime(new Date('2024-12-22T10:00:00Z')); // Sunday
      
      const result = resolveAnalysisDay('tomorrow');
      expect(result).toBe('MONDAY');
    });

    it('should pass through explicit day names unchanged', () => {
      expect(resolveAnalysisDay('MONDAY')).toBe('MONDAY');
      expect(resolveAnalysisDay('TUESDAY')).toBe('TUESDAY');
      expect(resolveAnalysisDay('WEDNESDAY')).toBe('WEDNESDAY');
      expect(resolveAnalysisDay('THURSDAY')).toBe('THURSDAY');
      expect(resolveAnalysisDay('FRIDAY')).toBe('FRIDAY');
      expect(resolveAnalysisDay('SATURDAY')).toBe('SATURDAY');
      expect(resolveAnalysisDay('SUNDAY')).toBe('SUNDAY');
    });

    it('should handle different days of the week', () => {
      // Test each day
      const testCases = [
        { date: '2024-12-22T10:00:00Z', expected: 'SUNDAY' },   // Sunday
        { date: '2024-12-23T10:00:00Z', expected: 'MONDAY' },   // Monday
        { date: '2024-12-24T10:00:00Z', expected: 'TUESDAY' },  // Tuesday
        { date: '2024-12-25T10:00:00Z', expected: 'WEDNESDAY' },// Wednesday
        { date: '2024-12-26T10:00:00Z', expected: 'THURSDAY' }, // Thursday
        { date: '2024-12-27T10:00:00Z', expected: 'FRIDAY' },   // Friday
        { date: '2024-12-28T10:00:00Z', expected: 'SATURDAY' }, // Saturday
      ];

      testCases.forEach(({ date, expected }) => {
        vi.setSystemTime(new Date(date));
        expect(resolveAnalysisDay('today')).toBe(expected);
      });
    });
  });

  describe('getDateForAnalysisDay', () => {
    beforeEach(() => {
      // Mock Date to be consistent (Monday, December 23, 2024)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-12-23T10:00:00Z')); // Monday
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return today\'s date in YYYY-MM-DD format for "today"', () => {
      const result = getDateForAnalysisDay('today');
      expect(result).toBe('2024-12-23');
    });

    it('should return tomorrow\'s date in YYYY-MM-DD format for "tomorrow"', () => {
      const result = getDateForAnalysisDay('tomorrow');
      expect(result).toBe('2024-12-24');
    });

    it('should handle month boundary (Dec 31 -> Jan 1)', () => {
      vi.setSystemTime(new Date('2024-12-31T10:00:00Z'));
      
      const result = getDateForAnalysisDay('tomorrow');
      expect(result).toBe('2025-01-01');
    });

    it('should handle year boundary correctly', () => {
      vi.setSystemTime(new Date('2024-12-31T23:59:59Z'));
      
      const result = getDateForAnalysisDay('tomorrow');
      expect(result).toBe('2025-01-01');
    });

    it('should calculate next occurrence of MONDAY (same day)', () => {
      // Today is Monday, next Monday is today (0 days away)
      const result = getDateForAnalysisDay('MONDAY');
      expect(result).toBe('2024-12-23'); // Same day
    });

    it('should calculate next occurrence of TUESDAY (1 day away)', () => {
      const result = getDateForAnalysisDay('TUESDAY');
      expect(result).toBe('2024-12-24');
    });

    it('should calculate next occurrence of FRIDAY (4 days away)', () => {
      const result = getDateForAnalysisDay('FRIDAY');
      expect(result).toBe('2024-12-27');
    });

    it('should calculate next occurrence of SUNDAY (wraps to next week)', () => {
      // Today is Monday, next Sunday is 6 days away
      const result = getDateForAnalysisDay('SUNDAY');
      expect(result).toBe('2024-12-29');
    });

    it('should handle week wraparound for all days', () => {
      vi.setSystemTime(new Date('2024-12-28T10:00:00Z')); // Saturday
      
      const result = getDateForAnalysisDay('MONDAY');
      expect(result).toBe('2024-12-30'); // Next Monday (2 days away)
    });

    it('should handle invalid day name by falling back to today', () => {
      const result = getDateForAnalysisDay('INVALID_DAY');
      expect(result).toBe('2024-12-23'); // Falls back to today
    });

    it('should handle lowercase day names', () => {
      const result = getDateForAnalysisDay('monday');
      // Current implementation converts to uppercase
      expect(result).toBe('2024-12-23');
    });

    it('should handle edge case at midnight', () => {
      vi.setSystemTime(new Date('2024-12-23T00:00:00Z'));
      
      const today = getDateForAnalysisDay('today');
      const tomorrow = getDateForAnalysisDay('tomorrow');
      
      expect(today).toBe('2024-12-23');
      expect(tomorrow).toBe('2024-12-24');
    });

    it('should handle leap year (Feb 29)', () => {
      vi.setSystemTime(new Date('2024-02-28T10:00:00Z')); // 2024 is a leap year
      
      const result = getDateForAnalysisDay('tomorrow');
      expect(result).toBe('2024-02-29');
    });

    it('should handle non-leap year (Feb 28 -> Mar 1)', () => {
      vi.setSystemTime(new Date('2023-02-28T10:00:00Z')); // 2023 is not a leap year
      
      const result = getDateForAnalysisDay('tomorrow');
      expect(result).toBe('2023-03-01');
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-12-23T10:00:00Z')); // Monday
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should have consistent results between resolveAnalysisDay and getDateForAnalysisDay', () => {
      const day = resolveAnalysisDay('today');
      const date = getDateForAnalysisDay('today');
      
      expect(day).toBe('MONDAY');
      expect(date).toBe('2024-12-23');
      
      // Verify the date is actually a Monday
      const dateObj = new Date(date + 'T00:00:00Z'); // Parse as UTC
      expect(dateObj.getUTCDay()).toBe(1); // Monday = 1
    });

    it('should handle full week cycle', () => {
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      
      days.forEach((day, index) => {
        const date = getDateForAnalysisDay(day);
        const dateObj = new Date(date);
        
        // Calculate expected day index
        const currentDayIndex = 1; // Monday
        const targetDayIndex = index;
        const expectedDaysAway = (targetDayIndex - currentDayIndex + 7) % 7;
        
        const expectedDate = new Date('2024-12-23T10:00:00Z');
        expectedDate.setDate(expectedDate.getDate() + expectedDaysAway);
        
        expect(date).toBe(expectedDate.toISOString().split('T')[0]);
      });
    });
  });

  describe('timezone handling', () => {
    it('should use UTC consistently', () => {
      vi.useFakeTimers();
      
      // Test at different times of day
      const times = [
        '2024-12-23T00:00:00Z',
        '2024-12-23T12:00:00Z',
        '2024-12-23T23:59:59Z',
      ];
      
      times.forEach(time => {
        vi.setSystemTime(new Date(time));
        const result = getDateForAnalysisDay('today');
        expect(result).toBe('2024-12-23');
      });
      
      vi.useRealTimers();
    });
  });
});
