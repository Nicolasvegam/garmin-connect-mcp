export const USER_SUMMARY_ENDPOINT = '/usersummary-service/usersummary/daily';
export const HEART_RATE_ENDPOINT = '/wellness-service/wellness/dailyHeartRate';
export const STEPS_CHART_ENDPOINT = '/wellness-service/wellness/dailySummaryChart';
export const DAILY_STRESS_ENDPOINT = '/wellness-service/wellness/dailyStress';
export const DAILY_RESPIRATION_ENDPOINT = '/wellness-service/wellness/daily/respiration';
export const DAILY_SPO2_ENDPOINT = '/wellness-service/wellness/daily/spo2';
export const DAILY_INTENSITY_MINUTES_ENDPOINT = '/wellness-service/wellness/daily/im';
export const FLOORS_CHART_ENDPOINT = '/wellness-service/wellness/floorsChartData/daily';
export const DAILY_EVENTS_ENDPOINT = '/wellness-service/wellness/dailyEvents';
export const BODY_BATTERY_ENDPOINT = '/wellness-service/wellness/bodyBattery/reports/daily';
export const BODY_BATTERY_EVENTS_ENDPOINT = '/wellness-service/wellness/bodyBattery/events';
export const SLEEP_DAILY_ENDPOINT = '/wellness-service/wellness/dailySleepData';
export const HYDRATION_ENDPOINT = '/usersummary-service/usersummary/hydration/daily';
export const RHR_ENDPOINT = '/userstats-service/wellness/daily';
export const DAILY_STEPS_ENDPOINT = '/usersummary-service/stats/steps/daily';
export const WEEKLY_STEPS_ENDPOINT = '/usersummary-service/stats/steps/weekly';
export const WEEKLY_STRESS_ENDPOINT = '/usersummary-service/stats/stress/weekly';
export const WEEKLY_INTENSITY_MINUTES_ENDPOINT = '/usersummary-service/stats/im/weekly';

export const BODY_COMPOSITION_ENDPOINT = '/weight-service/weight/dateRange';
export const WEIGHT_DAY_VIEW_ENDPOINT = '/weight-service/weight/dayview';
export const WEIGH_INS_RANGE_ENDPOINT = '/weight-service/weight/range';
export const BLOOD_PRESSURE_ENDPOINT = '/bloodpressure-service/bloodpressure/range';

export const VO2_MAX_ENDPOINT = '/metrics-service/metrics/maxmet/daily';
export const TRAINING_READINESS_ENDPOINT = '/metrics-service/metrics/trainingreadiness';
export const TRAINING_STATUS_ENDPOINT = '/metrics-service/metrics/trainingstatus/aggregated';
export const HRV_ENDPOINT = '/hrv-service/hrv';
export const ENDURANCE_SCORE_ENDPOINT = '/metrics-service/metrics/endurancescore';
export const HILL_SCORE_ENDPOINT = '/metrics-service/metrics/hillscore';
export const RACE_PREDICTIONS_ENDPOINT = '/metrics-service/metrics/racepredictions';
export const FITNESS_AGE_ENDPOINT = '/fitnessage-service/fitnessage';
export const PERSONAL_RECORD_ENDPOINT = '/personalrecord-service/personalrecord/prs';
export const LACTATE_THRESHOLD_ENDPOINT = '/biometric-service/biometric/latestLactateThreshold';
export const CYCLING_FTP_ENDPOINT = '/biometric-service/biometric/latestFunctionalThresholdPower/CYCLING';

export const ACTIVITIES_SEARCH_ENDPOINT = '/activitylist-service/activities/search/activities';
export const ACTIVITIES_COUNT_ENDPOINT = '/activitylist-service/activities/count';
export const ACTIVITY_ENDPOINT = '/activity-service/activity';
export const ACTIVITY_TYPES_ENDPOINT = '/activity-service/activity/activityTypes';
export const ACTIVITY_DETAILS_SUBPATH = 'details';
export const ACTIVITY_SPLITS_SUBPATH = 'splits';
export const ACTIVITY_WEATHER_SUBPATH = 'weather';
export const ACTIVITY_HR_ZONES_SUBPATH = 'hrTimeInZones';
export const ACTIVITY_EXERCISE_SETS_SUBPATH = 'exerciseSets';
export const FITNESS_STATS_ENDPOINT = '/fitnessstats-service/activity';

export const USER_PROFILE_ENDPOINT = '/userprofile-service/socialProfile';
export const USER_SETTINGS_ENDPOINT = '/userprofile-service/userprofile/user-settings';

export const DEVICE_LIST_ENDPOINT = '/device-service/deviceregistration/devices';
export const DEVICE_SETTINGS_ENDPOINT = '/device-service/deviceservice/device-info/settings';
export const DEVICE_LAST_USED_ENDPOINT = '/device-service/deviceservice/mylastused';
export const PRIMARY_TRAINING_DEVICE_ENDPOINT = '/web-gateway/device-info/primary-training-device';
export const DEVICE_SOLAR_ENDPOINT = '/web-gateway/solar';

export const GEAR_ENDPOINT = '/gear-service/gear/filterGear';
export const GEAR_STATS_ENDPOINT = '/gear-service/gear/stats';
export const GOALS_ENDPOINT = '/goal-service/goal/goals';

export const EARNED_BADGES_ENDPOINT = '/badge-service/badge/earned';
export const WORKOUTS_ENDPOINT = '/workout-service/workouts';
export const WORKOUT_ENDPOINT = '/workout-service/workout';

export const ACTIVITY_DETAILS_MAX_CHART_SIZE = 2000;
export const ACTIVITY_DETAILS_MAX_POLYLINE_SIZE = 4000;
export const RHR_METRIC_ID = 60;
export const SLEEP_NON_SLEEP_BUFFER_MINUTES = 60;
export const FITNESS_STATS_AGGREGATION = 'lifetime';
export const DEFAULT_GOALS_STATUS = 'active';
export const DEFAULT_ACTIVITIES_LIMIT = 20;
export const DEFAULT_GOALS_LIMIT = 100;
export const DEFAULT_WORKOUTS_LIMIT = 100;
export const DEFAULT_ACTIVITIES_BY_DATE_LIMIT = 100;
