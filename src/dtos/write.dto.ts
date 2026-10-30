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

// ── Workout creation ──────────────────────────────────────────────────────

const workoutTargetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('no_target') }),
  z.object({
    type: z.literal('heart_rate'),
    minBpm: z.number().int().min(60).max(250).describe('Minimum heart rate in BPM'),
    maxBpm: z.number().int().min(60).max(250).describe('Maximum heart rate in BPM'),
  }),
  z.object({
    type: z.literal('pace'),
    minPaceMinPerKm: z
      .number()
      .positive()
      .describe('Slowest acceptable pace in min/km (e.g. 5.5 for 5:30/km)'),
    maxPaceMinPerKm: z
      .number()
      .positive()
      .describe('Fastest acceptable pace in min/km (e.g. 4.5 for 4:30/km)'),
  }),
]);

const timeEndConditionSchema = z.object({
  type: z.literal('time'),
  durationSeconds: z.number().positive().describe('Duration in seconds (e.g. 300 for 5 min)'),
});
const distanceEndConditionSchema = z.object({
  type: z.literal('distance'),
  distanceMeters: z.number().positive().describe('Distance in meters (e.g. 1000 for 1 km)'),
});
const workoutEndConditionSchema = z.discriminatedUnion('type', [
  timeEndConditionSchema,
  distanceEndConditionSchema,
]);

const executableStepSchema = z.object({
  type: z.enum(['warmup', 'cooldown', 'interval', 'recovery', 'rest', 'other']),
  endCondition: workoutEndConditionSchema,
  target: workoutTargetSchema,
});

const repeatGroupSchema = z.object({
  type: z.literal('repeat'),
  iterations: z.number().int().positive().describe('Number of repetitions'),
  steps: z.array(executableStepSchema).min(1).describe('Steps to repeat'),
  skipLastRestStep: z
    .boolean()
    .optional()
    .default(false)
    .describe('Omit the final recovery step on the last rep'),
});

const workoutStepSchema = z.union([executableStepSchema, repeatGroupSchema]);

export const createWorkoutSchema = z.object({
  name: z.string().describe('Workout name (e.g. "5 x 5 min @ 4:25")'),
  sport: z
    .enum(['running', 'cycling', 'swimming', 'strength_training'])
    .default('running')
    .describe('Sport type. Defaults to running'),
  steps: z.array(workoutStepSchema).min(1).describe('Ordered list of steps and repeat groups'),
});

export type CreateWorkoutDto = z.infer<typeof createWorkoutSchema>;

export const scheduleWorkoutSchema = z.object({
  workoutId: z.string().describe('The Garmin workout ID to schedule'),
  date: dateString.describe('Date to schedule the workout on (YYYY-MM-DD)'),
});

export type ScheduleWorkoutDto = z.infer<typeof scheduleWorkoutSchema>;

export const deleteWorkoutSchema = z.object({
  workoutId: z.string().describe('The Garmin workout ID to delete'),
});

export type DeleteWorkoutDto = z.infer<typeof deleteWorkoutSchema>;
