import { z } from 'zod';
import { dateString, paceString, MAX_REPEAT_ITERATIONS } from '../constants';

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

export type WorkoutStepKind = 'warmup' | 'interval' | 'recovery' | 'cooldown';

export type CreateWorkoutStepDto = {
  kind: WorkoutStepKind;
  durationSec?: number;
  untilLapPress?: boolean;
  hr?: [number, number];
  pace?: [string, string];
};

export type WorkoutSport =
  | 'running'
  | 'cycling'
  | 'other'
  | 'swimming'
  | 'strength_training'
  | 'cardio_training'
  | 'yoga'
  | 'pilates'
  | 'hiit'
  | 'mobility'
  | 'rucking';

export type CreateWorkoutRepeatDto = {
  repeat: number;
  skipLastRecovery?: boolean;
  steps: CreateWorkoutStepDto[];
};

export type CreateWorkoutDto = {
  name: string;
  sport?: WorkoutSport;
  description?: string;
  date?: string;
  steps: (CreateWorkoutStepDto | CreateWorkoutRepeatDto)[];
};

export const createWorkoutStepSchema = z
  .object({
    kind: z.enum(['warmup', 'interval', 'recovery', 'cooldown']).describe('Step type'),
    durationSec: z
      .number()
      .int()
      .positive()
      .max(86400)
      .optional()
      .describe('Step duration in seconds. Give this or untilLapPress'),
    untilLapPress: z
      .boolean()
      .optional()
      .describe('true ends the step when the lap button is pressed instead of after a duration'),
    hr: z
      .tuple([z.number().int().min(30).max(250), z.number().int().min(30).max(250)])
      .optional()
      .describe('Heart rate range in bpm, e.g. [125, 149]. Either order'),
    pace: z
      .tuple([paceString.describe('One end of the range'), paceString.describe('The other end')])
      .optional()
      .describe('Pace range in m:ss per km, e.g. ["5:10", "5:39"]. Either order'),
  })
  .refine((step) => !(step.hr && step.pace), {
    message: 'A step takes hr or pace, not both',
  })
  .refine((step) => (step.durationSec !== undefined) !== (step.untilLapPress === true), {
    message: 'A step takes either durationSec or untilLapPress: true',
  });

export const createWorkoutRepeatSchema = z
  .object({
    repeat: z
      .number()
      .int()
      .min(1)
      .max(MAX_REPEAT_ITERATIONS)
      .describe('How many times to run the steps in this group'),
    skipLastRecovery: z
      .boolean()
      .optional()
      .describe('Drop the recovery at the end of the final repeat, e.g. when a cool-down follows. Defaults to false'),
    steps: z
      .array(createWorkoutStepSchema)
      .min(1)
      .describe('Steps repeated in order, e.g. an interval then a recovery. Repeats cannot be nested'),
  })
  .refine((group) => !group.skipLastRecovery || group.steps[group.steps.length - 1]?.kind === 'recovery', {
    message: 'skipLastRecovery needs the group to end with a recovery step',
  });

export const createWorkoutSchema = z.object({
  name: z.string().min(1).describe('Workout name'),
  sport: z
    .enum([
      'running',
      'cycling',
      'other',
      'swimming',
      'strength_training',
      'cardio_training',
      'yoga',
      'pilates',
      'hiit',
      'mobility',
      'rucking',
    ])
    .optional()
    .describe('Sport type. Defaults to running'),
  description: z.string().optional().describe('Workout description. Optional'),
  date: dateString
    .optional()
    .describe('Date in YYYY-MM-DD format to schedule the workout on. Optional; omit to only save it'),
  steps: z
    .array(z.union([createWorkoutStepSchema, createWorkoutRepeatSchema]))
    .min(1)
    .describe('Steps in order, each a single step or a repeat group. A step without hr or pace has no target'),
});

export type ScheduleWorkoutDto = {
  workoutId: string;
  date: string;
};

export const scheduleWorkoutSchema = z.object({
  workoutId: z.string().describe('The workout ID to schedule'),
  date: dateString.describe('Date in YYYY-MM-DD format to schedule the workout on'),
});

export type DeleteWorkoutDto = {
  workoutId: string;
};

export const deleteWorkoutSchema = z.object({
  workoutId: z.string().describe('The workout ID to delete'),
});

export type UnscheduleWorkoutDto = {
  scheduleId: string;
};

export const unscheduleWorkoutSchema = z.object({
  scheduleId: z
    .string()
    .describe('The workoutScheduleId returned when the workout was scheduled, not the workoutId'),
});
