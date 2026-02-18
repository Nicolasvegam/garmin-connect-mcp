import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');

export type GetMenstrualCalendarDto = {
  startDate: string;
  endDate: string;
};

export const getMenstrualCalendarSchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
});
