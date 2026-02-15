import { z } from 'zod';

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
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
});

export type GetGearStatsDto = {
  gearUuid: string;
};

export const getGearStatsSchema = z.object({
  gearUuid: z.string().describe('The UUID of the gear item'),
});

export type GetWorkoutDto = {
  workoutId: string;
};

export const getWorkoutSchema = z.object({
  workoutId: z.string().describe('The workout ID'),
});
