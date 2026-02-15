import { z } from 'zod';

export type GetMenstrualCalendarDto = {
  startDate: string;
  endDate: string;
};

export const getMenstrualCalendarSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
});
