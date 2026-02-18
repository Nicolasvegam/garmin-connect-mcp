import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');

export type GetRacePredictionsDto = {
  startDate?: string;
  endDate?: string;
  type?: string;
};

export const getRacePredictionsSchema = z.object({
  startDate: dateString
    .optional()
    .describe('Start date in YYYY-MM-DD format. Omit for latest prediction only'),
  endDate: dateString
    .optional()
    .describe('End date in YYYY-MM-DD format. Required if startDate is provided'),
  type: z
    .enum(['daily', 'monthly'])
    .default('daily')
    .optional()
    .describe('Aggregation type: daily or monthly. Defaults to daily'),
});

export type GetLactateThresholdDto = {
  startDate?: string;
  endDate?: string;
  aggregation?: string;
};

export const getLactateThresholdSchema = z.object({
  startDate: dateString
    .optional()
    .describe('Start date in YYYY-MM-DD format. Omit for latest value only'),
  endDate: dateString
    .optional()
    .describe('End date in YYYY-MM-DD format. Required if startDate is provided'),
  aggregation: z
    .enum(['daily', 'weekly', 'monthly'])
    .default('daily')
    .optional()
    .describe('Aggregation type: daily, weekly, or monthly. Defaults to daily'),
});

export type GetScoreDto = {
  startDate: string;
  endDate?: string;
  aggregation?: string;
};

export const getScoreSchema = z.object({
  startDate: dateString
    .describe('Start date in YYYY-MM-DD format. If endDate is omitted, treated as single day'),
  endDate: dateString
    .optional()
    .describe('End date in YYYY-MM-DD format. Omit for single-day view'),
  aggregation: z
    .enum(['daily', 'weekly', 'monthly'])
    .optional()
    .describe('Aggregation for range mode: daily, weekly, or monthly. Only used when endDate is provided'),
});

export type GetTrainingPlanDto = {
  planId: string;
};

export const getTrainingPlanSchema = z.object({
  planId: z.string().describe('The training plan ID'),
});

export type GetScheduledWorkoutDto = {
  workoutId: string;
};

export const getScheduledWorkoutSchema = z.object({
  workoutId: z.string().describe('The scheduled workout ID'),
});
