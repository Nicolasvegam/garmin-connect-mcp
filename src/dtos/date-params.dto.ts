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
    .default(52)
    .optional()
    .describe('Number of weeks to look back (1-52). Defaults to 52 (full year)'),
});

export type DateRangeOptionalEndDto = {
  startDate: string;
  endDate?: string;
};

export const dateRangeOptionalEndSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z
    .string()
    .optional()
    .describe('End date in YYYY-MM-DD format. Defaults to startDate if not provided'),
});
