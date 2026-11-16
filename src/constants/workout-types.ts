export const EXECUTABLE_STEP_DTO = 'ExecutableStepDTO';
export const REPEAT_GROUP_DTO = 'RepeatGroupDTO';

export const WORKOUT_SPORT_TYPES = {
  running: { sportTypeId: 1, sportTypeKey: 'running' },
  cycling: { sportTypeId: 2, sportTypeKey: 'cycling' },
  other: { sportTypeId: 3, sportTypeKey: 'other' },
  swimming: { sportTypeId: 4, sportTypeKey: 'swimming' },
  strength_training: { sportTypeId: 5, sportTypeKey: 'strength_training' },
  cardio_training: { sportTypeId: 6, sportTypeKey: 'cardio_training' },
  yoga: { sportTypeId: 7, sportTypeKey: 'yoga' },
  pilates: { sportTypeId: 8, sportTypeKey: 'pilates' },
  hiit: { sportTypeId: 9, sportTypeKey: 'hiit' },
  mobility: { sportTypeId: 11, sportTypeKey: 'mobility' },
  rucking: { sportTypeId: 13, sportTypeKey: 'rucking' },
} as const;

export const WORKOUT_STEP_TYPES = {
  warmup: { stepTypeId: 1, stepTypeKey: 'warmup' },
  cooldown: { stepTypeId: 2, stepTypeKey: 'cooldown' },
  interval: { stepTypeId: 3, stepTypeKey: 'interval' },
  recovery: { stepTypeId: 4, stepTypeKey: 'recovery' },
} as const;

export const REPEAT_STEP_TYPE = { stepTypeId: 6, stepTypeKey: 'repeat' };

export const LAP_BUTTON_END_CONDITION = { conditionTypeId: 1, conditionTypeKey: 'lap.button' };
export const TIME_END_CONDITION = { conditionTypeId: 2, conditionTypeKey: 'time' };
export const ITERATIONS_END_CONDITION = { conditionTypeId: 7, conditionTypeKey: 'iterations' };

export const MAX_REPEAT_ITERATIONS = 99;

export const NO_TARGET = { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' };
export const HEART_RATE_TARGET = { workoutTargetTypeId: 4, workoutTargetTypeKey: 'heart.rate.zone' };
export const PACE_TARGET = { workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone' };

export const METERS_PER_KM = 1000;
