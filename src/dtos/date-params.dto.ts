import { z } from 'zod';
import { dateString } from '../constants';

export type DateParamDto = {
  date?: string;
};

export const dateParamSchema = z.object({
  date: dateString
    .optional()
    .describe('Date in YYYY-MM-DD format. Defaults to today if not provided'),
});

export type DateRangeParamDto = {
  startDate: string;
  endDate: string;
};

export const dateRangeParamSchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
});

export type WeeklyParamDto = {
  endDate: string;
  weeks?: number;
};

export const weeklyParamSchema = z.object({
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
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
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString
    .optional()
    .describe('End date in YYYY-MM-DD format. Defaults to startDate if not provided'),
});
