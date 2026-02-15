import { GarminAuth } from './garmin-auth';
import {
  USER_SUMMARY_ENDPOINT,
  HEART_RATE_ENDPOINT,
  STEPS_CHART_ENDPOINT,
  DAILY_STRESS_ENDPOINT,
  DAILY_RESPIRATION_ENDPOINT,
  DAILY_SPO2_ENDPOINT,
  DAILY_INTENSITY_MINUTES_ENDPOINT,
  FLOORS_CHART_ENDPOINT,
  DAILY_EVENTS_ENDPOINT,
  BODY_BATTERY_ENDPOINT,
  BODY_BATTERY_EVENTS_ENDPOINT,
  SLEEP_DAILY_ENDPOINT,
  HYDRATION_ENDPOINT,
  RHR_ENDPOINT,
  DAILY_STEPS_ENDPOINT,
  WEEKLY_STEPS_ENDPOINT,
  WEEKLY_STRESS_ENDPOINT,
  WEEKLY_INTENSITY_MINUTES_ENDPOINT,
  BODY_COMPOSITION_ENDPOINT,
  WEIGHT_DAY_VIEW_ENDPOINT,
  WEIGH_INS_RANGE_ENDPOINT,
  BLOOD_PRESSURE_ENDPOINT,
  VO2_MAX_ENDPOINT,
  TRAINING_READINESS_ENDPOINT,
  TRAINING_STATUS_ENDPOINT,
  HRV_ENDPOINT,
  ENDURANCE_SCORE_ENDPOINT,
  HILL_SCORE_ENDPOINT,
  RACE_PREDICTIONS_ENDPOINT,
  FITNESS_AGE_ENDPOINT,
  PERSONAL_RECORD_ENDPOINT,
  LACTATE_THRESHOLD_ENDPOINT,
  CYCLING_FTP_ENDPOINT,
  ACTIVITIES_SEARCH_ENDPOINT,
  ACTIVITIES_COUNT_ENDPOINT,
  ACTIVITY_ENDPOINT,
  ACTIVITY_TYPES_ENDPOINT,
  ACTIVITY_DETAILS_SUBPATH,
  ACTIVITY_SPLITS_SUBPATH,
  ACTIVITY_WEATHER_SUBPATH,
  ACTIVITY_HR_ZONES_SUBPATH,
  ACTIVITY_EXERCISE_SETS_SUBPATH,
  FITNESS_STATS_ENDPOINT,
  USER_PROFILE_ENDPOINT,
  USER_SETTINGS_ENDPOINT,
  DEVICE_LIST_ENDPOINT,
  DEVICE_SETTINGS_ENDPOINT,
  DEVICE_LAST_USED_ENDPOINT,
  PRIMARY_TRAINING_DEVICE_ENDPOINT,
  DEVICE_SOLAR_ENDPOINT,
  GEAR_ENDPOINT,
  GEAR_STATS_ENDPOINT,
  GOALS_ENDPOINT,
  EARNED_BADGES_ENDPOINT,
  WORKOUTS_ENDPOINT,
  WORKOUT_ENDPOINT,
  ACTIVITY_DETAILS_MAX_CHART_SIZE,
  ACTIVITY_DETAILS_MAX_POLYLINE_SIZE,
  RHR_METRIC_ID,
  SLEEP_NON_SLEEP_BUFFER_MINUTES,
  FITNESS_STATS_AGGREGATION,
  DEFAULT_GOALS_STATUS,
  DEFAULT_ACTIVITIES_LIMIT,
  DEFAULT_GOALS_LIMIT,
  DEFAULT_WORKOUTS_LIMIT,
  DEFAULT_ACTIVITIES_BY_DATE_LIMIT,
} from '../constants/garmin-endpoints';

function todayString(): string {
  return new Date().toISOString().split('T')[0]!;
}

export class GarminClient {
  private auth: GarminAuth;

  constructor(email: string, password: string) {
    this.auth = new GarminAuth(email, password);
  }

  private request<T>(endpoint: string): Promise<T> {
    return this.auth.request<T>(endpoint);
  }

  private get displayName(): string {
    return this.auth.displayName;
  }

  private get userProfilePk(): number {
    return this.auth.userProfilePk;
  }

  async getActivities(start = 0, limit = DEFAULT_ACTIVITIES_LIMIT): Promise<unknown> {
    return this.request(`${ACTIVITIES_SEARCH_ENDPOINT}?start=${start}&limit=${limit}`);
  }

  async getActivitiesByDate(startDate: string, endDate: string, activityType?: string): Promise<unknown> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      start: '0',
      limit: String(DEFAULT_ACTIVITIES_BY_DATE_LIMIT),
    });
    if (activityType) params.set('activityType', activityType);
    return this.request(`${ACTIVITIES_SEARCH_ENDPOINT}?${params}`);
  }

  async getLastActivity(): Promise<unknown> {
    return this.request(`${ACTIVITIES_SEARCH_ENDPOINT}?start=0&limit=1`);
  }

  async countActivities(): Promise<unknown> {
    return this.request(ACTIVITIES_COUNT_ENDPOINT);
  }

  async getActivity(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}`);
  }

  async getActivityDetails(activityId: number): Promise<unknown> {
    return this.request(
      `${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_DETAILS_SUBPATH}?maxChartSize=${ACTIVITY_DETAILS_MAX_CHART_SIZE}&maxPolylineSize=${ACTIVITY_DETAILS_MAX_POLYLINE_SIZE}`,
    );
  }

  async getActivitySplits(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_SPLITS_SUBPATH}`);
  }

  async getActivityWeather(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_WEATHER_SUBPATH}`);
  }

  async getActivityHrZones(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_HR_ZONES_SUBPATH}`);
  }

  async getActivityExerciseSets(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_EXERCISE_SETS_SUBPATH}`);
  }

  async getActivityTypes(): Promise<unknown> {
    return this.request(ACTIVITY_TYPES_ENDPOINT);
  }

  async getProgressSummary(startDate: string, endDate: string, metric = 'distance'): Promise<unknown> {
    return this.request(
      `${FITNESS_STATS_ENDPOINT}?startDate=${startDate}&endDate=${endDate}&aggregation=${FITNESS_STATS_AGGREGATION}&groupByParentActivityType=true&metric=${metric}`,
    );
  }

  async getDailySummary(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${USER_SUMMARY_ENDPOINT}/${this.displayName}?calendarDate=${resolvedDate}`);
  }

  async getSteps(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${USER_SUMMARY_ENDPOINT}/${this.displayName}?calendarDate=${resolvedDate}`);
  }

  async getStepsChart(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${STEPS_CHART_ENDPOINT}/${this.displayName}?date=${resolvedDate}`);
  }

  async getHeartRate(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${HEART_RATE_ENDPOINT}/${this.displayName}?date=${resolvedDate}`);
  }

  async getRestingHeartRate(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(
      `${RHR_ENDPOINT}/${this.displayName}?fromDate=${resolvedDate}&untilDate=${resolvedDate}&metricId=${RHR_METRIC_ID}`,
    );
  }

  async getStress(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${DAILY_STRESS_ENDPOINT}/${resolvedDate}`);
  }

  async getBodyBattery(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${BODY_BATTERY_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getBodyBatteryEvents(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${BODY_BATTERY_EVENTS_ENDPOINT}/${resolvedDate}`);
  }

  async getRespiration(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${DAILY_RESPIRATION_ENDPOINT}/${resolvedDate}`);
  }

  async getSpO2(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${DAILY_SPO2_ENDPOINT}/${resolvedDate}`);
  }

  async getIntensityMinutes(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${DAILY_INTENSITY_MINUTES_ENDPOINT}/${resolvedDate}`);
  }

  async getFloors(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${FLOORS_CHART_ENDPOINT}/${resolvedDate}`);
  }

  async getHydration(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${HYDRATION_ENDPOINT}/${resolvedDate}`);
  }

  async getDailyEvents(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${DAILY_EVENTS_ENDPOINT}?calendarDate=${resolvedDate}`);
  }

  async getDailySteps(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${DAILY_STEPS_ENDPOINT}/${startDate}/${endDate}`);
  }

  async getWeeklySteps(endDate: string, weeks = 1): Promise<unknown> {
    return this.request(`${WEEKLY_STEPS_ENDPOINT}/${endDate}/${weeks}`);
  }

  async getWeeklyStress(endDate: string, weeks = 1): Promise<unknown> {
    return this.request(`${WEEKLY_STRESS_ENDPOINT}/${endDate}/${weeks}`);
  }

  async getWeeklyIntensityMinutes(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${WEEKLY_INTENSITY_MINUTES_ENDPOINT}/${startDate}/${endDate}`);
  }

  async getSleepData(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(
      `${SLEEP_DAILY_ENDPOINT}/${this.displayName}?date=${resolvedDate}&nonSleepBufferMinutes=${SLEEP_NON_SLEEP_BUFFER_MINUTES}`,
    );
  }

  async getSleepDataRaw(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${SLEEP_DAILY_ENDPOINT}/${this.displayName}?date=${resolvedDate}`);
  }

  async getBodyComposition(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${BODY_COMPOSITION_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getLatestWeight(): Promise<unknown> {
    const resolvedDate = todayString();
    return this.request(`${WEIGHT_DAY_VIEW_ENDPOINT}/${resolvedDate}?includeAll=true`);
  }

  async getDailyWeighIns(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${WEIGHT_DAY_VIEW_ENDPOINT}/${resolvedDate}?includeAll=true`);
  }

  async getWeighIns(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${WEIGH_INS_RANGE_ENDPOINT}/${startDate}/${endDate}?includeAll=true`);
  }

  async getBloodPressure(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${BLOOD_PRESSURE_ENDPOINT}/${startDate}/${endDate}`);
  }

  async getVO2Max(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${VO2_MAX_ENDPOINT}/${resolvedDate}/${resolvedDate}`);
  }

  async getTrainingReadiness(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${TRAINING_READINESS_ENDPOINT}/${resolvedDate}`);
  }

  async getTrainingStatus(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${TRAINING_STATUS_ENDPOINT}/${resolvedDate}`);
  }

  async getHRV(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${HRV_ENDPOINT}/${resolvedDate}`);
  }

  async getEnduranceScore(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${ENDURANCE_SCORE_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getHillScore(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${HILL_SCORE_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getRacePredictions(): Promise<unknown> {
    return this.request(`${RACE_PREDICTIONS_ENDPOINT}/latest/${this.displayName}`);
  }

  async getFitnessAge(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${FITNESS_AGE_ENDPOINT}/${resolvedDate}`);
  }

  async getPersonalRecords(): Promise<unknown> {
    return this.request(`${PERSONAL_RECORD_ENDPOINT}/${this.displayName}`);
  }

  async getLactateThreshold(): Promise<unknown> {
    return this.request(LACTATE_THRESHOLD_ENDPOINT);
  }

  async getCyclingFTP(): Promise<unknown> {
    return this.request(CYCLING_FTP_ENDPOINT);
  }

  async getUserProfile(): Promise<unknown> {
    return this.request(USER_PROFILE_ENDPOINT);
  }

  async getUserSettings(): Promise<unknown> {
    return this.request(USER_SETTINGS_ENDPOINT);
  }

  async getDevices(): Promise<unknown> {
    return this.request(DEVICE_LIST_ENDPOINT);
  }

  async getDeviceSettings(deviceId: string): Promise<unknown> {
    return this.request(`${DEVICE_SETTINGS_ENDPOINT}/${deviceId}`);
  }

  async getDeviceLastUsed(): Promise<unknown> {
    return this.request(DEVICE_LAST_USED_ENDPOINT);
  }

  async getPrimaryTrainingDevice(): Promise<unknown> {
    return this.request(PRIMARY_TRAINING_DEVICE_ENDPOINT);
  }

  async getDeviceSolarData(deviceId: string, startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${DEVICE_SOLAR_ENDPOINT}/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getGear(): Promise<unknown> {
    return this.request(`${GEAR_ENDPOINT}?userProfilePk=${this.userProfilePk}`);
  }

  async getGearStats(gearUuid: string): Promise<unknown> {
    return this.request(`${GEAR_STATS_ENDPOINT}/${gearUuid}`);
  }

  async getGoals(status = DEFAULT_GOALS_STATUS): Promise<unknown> {
    return this.request(`${GOALS_ENDPOINT}?status=${status}&start=0&limit=${DEFAULT_GOALS_LIMIT}`);
  }

  async getEarnedBadges(): Promise<unknown> {
    return this.request(EARNED_BADGES_ENDPOINT);
  }

  async getWorkouts(start = 0, limit = DEFAULT_WORKOUTS_LIMIT): Promise<unknown> {
    return this.request(`${WORKOUTS_ENDPOINT}?start=${start}&limit=${limit}`);
  }

  async getWorkout(workoutId: string): Promise<unknown> {
    return this.request(`${WORKOUT_ENDPOINT}/${workoutId}`);
  }
}
