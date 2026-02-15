import { z } from 'zod';

export type DateParamDto = {
  date?: string;
};

export const dateParamSchema = z.object({
  date: z
    .string()
    .optional()
    .describe('Date in YYYY-MM-DD format. Defaults to today if not provided'),
});

export type DateRangeParamDto = {
  startDate: string;
  endDate: string;
};

export const dateRangeParamSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
});

export type WeeklyParamDto = {
  endDate: string;
  weeks?: number;
};

export const weeklyParamSchema = z.object({
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  weeks: z
    .number()
    .min(1)
    .max(52)
    .default(1)
    .optional()
    .describe('Number of weeks to look back. Defaults to 1'),
});
