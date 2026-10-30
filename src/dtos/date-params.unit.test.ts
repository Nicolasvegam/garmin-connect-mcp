import { describe, expect, it } from 'vitest';
import { dateString } from '../constants';
import { dateRangeParamSchema, weeklyParamSchema } from './date-params.dto';
import { getActivitiesSchema } from './activities.dto';

describe('date and activity input schemas', () => {
  it('accepts YYYY-MM-DD dates', () => {
    expect(dateString.parse('2024-01-31')).toBe('2024-01-31');
    expect(dateRangeParamSchema.parse({ startDate: '2024-01-01', endDate: '2024-01-07' })).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-07',
    });
  });

  it('rejects dates that are not YYYY-MM-DD', () => {
    expect(dateString.safeParse('01-31-2024').success).toBe(false);
    expect(dateString.safeParse('2024/01/31').success).toBe(false);
    expect(dateString.safeParse('').success).toBe(false);
  });

  it('bounds activity pagination and weekly lookback', () => {
    expect(getActivitiesSchema.safeParse({ start: -1 }).success).toBe(false);
    expect(getActivitiesSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(getActivitiesSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(getActivitiesSchema.parse({ limit: 20 }).limit).toBe(20);
    expect(weeklyParamSchema.safeParse({ endDate: '2024-01-01', weeks: 0 }).success).toBe(false);
    expect(weeklyParamSchema.safeParse({ endDate: '2024-01-01', weeks: 53 }).success).toBe(false);
    expect(weeklyParamSchema.parse({ endDate: '2024-01-01', weeks: 4 }).weeks).toBe(4);
  });
});
