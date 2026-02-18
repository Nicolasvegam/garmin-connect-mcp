import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');

export type GetActivitiesDto = {
  start?: number;
  limit?: number;
  activityType?: string;
};

export const getActivitiesSchema = z.object({
  start: z
    .number()
    .min(0)
    .default(0)
    .optional()
    .describe('Pagination offset. Defaults to 0'),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .describe('Number of activities to return (1-100). Defaults to 20'),
  activityType: z
    .string()
    .optional()
    .describe('Filter by activity type (e.g. running, cycling, swimming)'),
});

export type GetActivitiesByDateDto = {
  startDate: string;
  endDate: string;
  activityType?: string;
};

export const getActivitiesByDateSchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
  activityType: z
    .string()
    .optional()
    .describe('Filter by activity type (e.g. running, cycling, swimming)'),
});

export type GetActivityDto = {
  activityId: number;
};

export const getActivitySchema = z.object({
  activityId: z.number().positive().describe('The Garmin activity ID'),
});

export type GetProgressSummaryDto = {
  startDate: string;
  endDate: string;
  metric?: string;
};

export const getProgressSummarySchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
  metric: z
    .string()
    .default('distance')
    .optional()
    .describe('Metric to aggregate: distance, duration, calories. Defaults to distance'),
});
