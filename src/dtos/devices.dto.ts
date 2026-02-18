import { z } from 'zod';
import { dateString } from '../constants';

export type GetDeviceSettingsDto = {
  deviceId: string;
};

export const getDeviceSettingsSchema = z.object({
  deviceId: z.string().describe('The Garmin device ID'),
});

export type GetDeviceSolarDto = {
  deviceId: string;
  startDate: string;
  endDate: string;
};

export const getDeviceSolarSchema = z.object({
  deviceId: z.string().describe('The Garmin device ID'),
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
});

export type GetGearStatsDto = {
  gearUuid: string;
};

export const getGearStatsSchema = z.object({
  gearUuid: z.string().uuid().describe('The UUID of the gear item'),
});

export type GetWorkoutDto = {
  workoutId: string;
};

export const getWorkoutSchema = z.object({
  workoutId: z.string().describe('The workout ID'),
});

export type GetGearActivitiesDto = {
  gearUuid: string;
  start?: number;
  limit?: number;
};

export const getGearActivitiesSchema = z.object({
  gearUuid: z.string().uuid().describe('The UUID of the gear item'),
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
});
