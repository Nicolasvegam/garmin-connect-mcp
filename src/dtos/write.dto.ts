import { z } from 'zod';
import { dateString } from '../constants';

export type SetActivityNameDto = {
  activityId: number;
  name: string;
};

export const setActivityNameSchema = z.object({
  activityId: z.number().positive().describe('The Garmin activity ID'),
  name: z.string().describe('New name for the activity'),
});

export type CreateManualActivityDto = {
  activityName: string;
  activityTypeKey: string;
  startTimeInGMT: string;
  elapsedDurationInSecs: number;
  distanceInMeters?: number;
};

export const createManualActivitySchema = z.object({
  activityName: z.string().describe('Name for the activity (e.g. "Morning Run")'),
  activityTypeKey: z.string().describe('Activity type key (e.g. running, cycling, swimming). Use get_activity_types to see all options'),
  startTimeInGMT: z
    .string()
    .describe('Start time in ISO 8601 format in GMT (e.g. "2024-01-15T08:30:00.000")'),
  elapsedDurationInSecs: z.number().positive().describe('Duration in seconds'),
  distanceInMeters: z.number().min(0).optional().describe('Distance in meters. Optional'),
});

export type DeleteActivityDto = {
  activityId: number;
};

export const deleteActivitySchema = z.object({
  activityId: z.number().positive().describe('The Garmin activity ID to delete'),
});

export type AddWeighInDto = {
  weight: number;
  unitKey?: string;
  date?: string;
};

export const addWeighInSchema = z.object({
  weight: z.number().positive().max(700).describe('Weight value'),
  unitKey: z
    .enum(['kg', 'lbs'])
    .default('kg')
    .optional()
    .describe('Weight unit: kg or lbs. Defaults to kg'),
  date: dateString.optional().describe('Date in YYYY-MM-DD format. Defaults to today'),
});

export type SetHydrationDto = {
  date?: string;
  valueMl: number;
};

export const setHydrationSchema = z.object({
  date: dateString.optional().describe('Date in YYYY-MM-DD format. Defaults to today'),
  valueMl: z.number().min(0).max(20000).describe('Hydration value in milliliters'),
});

export type SetBloodPressureDto = {
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp?: string;
  notes?: string;
};

export const setBloodPressureSchema = z.object({
  systolic: z.number().positive().max(300).describe('Systolic pressure (mmHg)'),
  diastolic: z.number().positive().max(200).describe('Diastolic pressure (mmHg)'),
  pulse: z.number().positive().max(300).describe('Pulse rate (bpm)'),
  timestamp: z
    .string()
    .optional()
    .describe('Measurement timestamp in ISO 8601 format. Defaults to now'),
  notes: z.string().optional().describe('Optional notes about the measurement'),
});

export type GearActivityDto = {
  gearUuid: string;
  activityId: number;
};

export const gearActivitySchema = z.object({
  gearUuid: z.string().uuid().describe('The UUID of the gear item'),
  activityId: z.number().positive().describe('The Garmin activity ID'),
});

// ── Course management ─────────────────────────────────────────────────────────

const courseGeoPointSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Latitude in decimal degrees'),
  longitude: z.number().min(-180).max(180).describe('Longitude in decimal degrees'),
  distance: z.number().min(0).describe('Cumulative distance from start in meters'),
  elevation: z.number().optional().describe('Elevation in meters above sea level'),
});

export const createCourseSchema = z.object({
  name: z.string().describe('Course name (e.g. "Waalwijk Morning Run ~15km")'),
  sport: z
    .enum(['running', 'cycling', 'swimming', 'hiking'])
    .default('running')
    .describe('Sport type. Defaults to running'),
  privacy: z
    .enum(['public', 'private'])
    .default('private')
    .describe('Visibility. Defaults to private'),
  geoPoints: z
    .array(courseGeoPointSchema)
    .min(2)
    .describe(
      'Ordered list of GPS points forming the course. Each point needs cumulative distance from start. ' +
        'Tip: compute cumulative distance using the Haversine formula between consecutive points.',
    ),
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;

export const deleteCourseSchema = z.object({
  courseId: z.number().positive().describe('The Garmin course ID to delete'),
});

export type DeleteCourseDto = z.infer<typeof deleteCourseSchema>;
