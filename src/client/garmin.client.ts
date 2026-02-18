import { GarminAuth, type RequestOptions } from './garmin-auth';
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
  ACTIVITY_TYPED_SPLITS_SUBPATH,
  ACTIVITY_SPLIT_SUMMARIES_SUBPATH,
  ACTIVITY_POWER_ZONES_SUBPATH,
  ACTIVITY_GEAR_ENDPOINT,
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
  GEAR_ACTIVITIES_ENDPOINT,
  GEAR_DEFAULTS_ENDPOINT,
  GOALS_ENDPOINT,
  EARNED_BADGES_ENDPOINT,
  AVAILABLE_BADGES_ENDPOINT,
  WORKOUTS_ENDPOINT,
  WORKOUT_ENDPOINT,
  TRAINING_PLANS_ENDPOINT,
  ADAPTIVE_TRAINING_PLAN_ENDPOINT,
  SCHEDULED_WORKOUT_ENDPOINT,
  MENSTRUAL_CALENDAR_ENDPOINT,
  MENSTRUAL_DAYVIEW_ENDPOINT,
  PREGNANCY_SNAPSHOT_ENDPOINT,
  LIFESTYLE_LOGGING_ENDPOINT,
  ADHOC_CHALLENGES_ENDPOINT,
  BADGE_CHALLENGES_ENDPOINT,
  AVAILABLE_BADGE_CHALLENGES_ENDPOINT,
  NON_COMPLETED_BADGE_CHALLENGES_ENDPOINT,
  INPROGRESS_VIRTUAL_CHALLENGES_ENDPOINT,
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
  DEFAULT_GEAR_ACTIVITIES_LIMIT,
  ADD_WEIGH_IN_ENDPOINT,
  SET_HYDRATION_ENDPOINT,
  SET_BLOOD_PRESSURE_ENDPOINT,
  GEAR_LINK_ENDPOINT,
  GEAR_UNLINK_ENDPOINT,
  DAILY_STEPS_MAX_RANGE_DAYS,
  BIOMETRIC_STATS_ENDPOINT,
} from '../constants/garmin-endpoints';

function todayString(): string {
  return new Date().toISOString().split('T')[0]!;
}

export class GarminClient {
  private auth: GarminAuth;

  constructor(email: string, password: string, promptMfa?: () => Promise<string>) {
    this.auth = new GarminAuth(email, password, promptMfa);
  }

  private request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.auth.request<T>(endpoint, options);
  }

  private get displayName(): string {
    return this.auth.displayName;
  }

  private get userProfilePk(): number {
    return this.auth.userProfilePk;
  }

  private chunkDateRange(startDate: string, endDate: string, maxDays: number): { start: string; end: string }[] {
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error(`startDate ${startDate} must not be after endDate ${endDate}`);
    }

    const chunks: { start: string; end: string }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let chunkStart = new Date(start);
    while (chunkStart <= end) {
      const chunkEnd = new Date(chunkStart);
      chunkEnd.setDate(chunkEnd.getDate() + maxDays - 1);
      if (chunkEnd > end) chunkEnd.setTime(end.getTime());

      chunks.push({
        start: chunkStart.toISOString().split('T')[0]!,
        end: chunkEnd.toISOString().split('T')[0]!,
      });

      chunkStart = new Date(chunkEnd);
      chunkStart.setDate(chunkStart.getDate() + 1);
    }
    return chunks;
  }

  dateRange(startDate: string, endDate: string): string[] {
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error(`startDate ${startDate} must not be after endDate ${endDate}`);
    }

    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]!);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  private async fetchRange(
    startDate: string,
    endDate: string,
    fetcher: (date: string) => Promise<unknown>,
  ): Promise<{ date: string; data: unknown }[]> {
    const dates = this.dateRange(startDate, endDate);
    const results: { date: string; data: unknown }[] = [];
    for (const date of dates) {
      const data = await fetcher(date).catch(() => null);
      results.push({ date, data });
    }
    return results;
  }

  async getActivities(start = 0, limit = DEFAULT_ACTIVITIES_LIMIT, activityType?: string): Promise<unknown> {
    const params = new URLSearchParams({
      start: String(start),
      limit: String(limit),
    });
    if (activityType) params.set('activityType', activityType);
    return this.request(`${ACTIVITIES_SEARCH_ENDPOINT}?${params}`);
  }

  async getActivitiesByDate(startDate: string, endDate: string, activityType?: string): Promise<unknown> {
    const allActivities: unknown[] = [];
    let start = 0;
    const pageSize = DEFAULT_ACTIVITIES_BY_DATE_LIMIT;

    while (true) {
      const params = new URLSearchParams({
        startDate,
        endDate,
        start: String(start),
        limit: String(pageSize),
      });
      if (activityType) params.set('activityType', activityType);

      const page = await this.request<unknown[]>(`${ACTIVITIES_SEARCH_ENDPOINT}?${params}`);

      if (!Array.isArray(page) || page.length === 0) break;

      allActivities.push(...page);

      if (page.length < pageSize) break;

      start += pageSize;
    }

    return allActivities;
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
    const chunks = this.chunkDateRange(startDate, endDate, DAILY_STEPS_MAX_RANGE_DAYS);

    if (chunks.length === 1) {
      return this.request(`${DAILY_STEPS_ENDPOINT}/${startDate}/${endDate}`);
    }

    const results: unknown[] = [];
    for (const chunk of chunks) {
      const data = await this.request<unknown[]>(`${DAILY_STEPS_ENDPOINT}/${chunk.start}/${chunk.end}`);
      if (Array.isArray(data)) {
        results.push(...data);
      } else {
        results.push(data);
      }
    }
    return results;
  }

  async getWeeklySteps(endDate: string, weeks = 52): Promise<unknown> {
    return this.request(`${WEEKLY_STEPS_ENDPOINT}/${endDate}/${weeks}`);
  }

  async getWeeklyStress(endDate: string, weeks = 52): Promise<unknown> {
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

  async getEnduranceScore(startDate: string, endDate?: string, aggregation = 'weekly'): Promise<unknown> {
    if (!endDate) {
      return this.request(`${ENDURANCE_SCORE_ENDPOINT}?calendarDate=${startDate}`);
    }
    return this.request(
      `${ENDURANCE_SCORE_ENDPOINT}/stats?startDate=${startDate}&endDate=${endDate}&aggregation=${aggregation}`,
    );
  }

  async getHillScore(startDate: string, endDate?: string, aggregation = 'daily'): Promise<unknown> {
    if (!endDate) {
      return this.request(`${HILL_SCORE_ENDPOINT}?calendarDate=${startDate}`);
    }
    return this.request(
      `${HILL_SCORE_ENDPOINT}/stats?startDate=${startDate}&endDate=${endDate}&aggregation=${aggregation}`,
    );
  }

  async getRacePredictions(startDate?: string, endDate?: string, type = 'daily'): Promise<unknown> {
    if (!startDate || !endDate) {
      return this.request(`${RACE_PREDICTIONS_ENDPOINT}/latest/${this.displayName}`);
    }
    return this.request(
      `${RACE_PREDICTIONS_ENDPOINT}/${type}/${this.displayName}?fromCalendarDate=${startDate}&toCalendarDate=${endDate}`,
    );
  }

  async getFitnessAge(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${FITNESS_AGE_ENDPOINT}/${resolvedDate}`);
  }

  async getPersonalRecords(): Promise<unknown> {
    return this.request(`${PERSONAL_RECORD_ENDPOINT}/${this.displayName}`);
  }

  async getLactateThreshold(startDate?: string, endDate?: string, aggregation = 'daily'): Promise<unknown> {
    if (!startDate || !endDate) {
      return this.request(LACTATE_THRESHOLD_ENDPOINT);
    }
    return this.request(
      `${BIOMETRIC_STATS_ENDPOINT}?startDate=${startDate}&endDate=${endDate}&aggregation=${aggregation}`,
    );
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
    const singleDay = startDate === endDate ? '&singleDayView=true' : '';
    return this.request(
      `${DEVICE_SOLAR_ENDPOINT}/${deviceId}?startDate=${startDate}&endDate=${endDate}${singleDay}`,
    );
  }

  async getGear(): Promise<unknown> {
    return this.request(`${GEAR_ENDPOINT}?userProfilePk=${this.userProfilePk}`);
  }

  async getGearStats(gearUuid: string): Promise<unknown> {
    return this.request(`${GEAR_STATS_ENDPOINT}/${gearUuid}`);
  }

  async getGoals(status = DEFAULT_GOALS_STATUS): Promise<unknown> {
    const allGoals: unknown[] = [];
    let start = 0;

    while (true) {
      const page = await this.request<unknown[]>(
        `${GOALS_ENDPOINT}?status=${status}&start=${start}&limit=${DEFAULT_GOALS_LIMIT}&sortOrder=asc`,
      );

      if (!Array.isArray(page) || page.length === 0) break;

      allGoals.push(...page);

      if (page.length < DEFAULT_GOALS_LIMIT) break;

      start += DEFAULT_GOALS_LIMIT;
    }

    return allGoals;
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

  async getActivityGear(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_GEAR_ENDPOINT}?activityId=${activityId}`);
  }

  async getActivityTypedSplits(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_TYPED_SPLITS_SUBPATH}`);
  }

  async getActivitySplitSummaries(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_SPLIT_SUMMARIES_SUBPATH}`);
  }

  async getActivityPowerInTimezones(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}/${ACTIVITY_POWER_ZONES_SUBPATH}`);
  }

  async getTrainingPlans(): Promise<unknown> {
    return this.request(TRAINING_PLANS_ENDPOINT);
  }

  async getTrainingPlan(planId: string): Promise<unknown> {
    return this.request(`${TRAINING_PLANS_ENDPOINT}/${planId}`);
  }

  async getAdaptiveTrainingPlan(planId: string): Promise<unknown> {
    return this.request(`${ADAPTIVE_TRAINING_PLAN_ENDPOINT}/${planId}`);
  }

  async getScheduledWorkout(workoutId: string): Promise<unknown> {
    return this.request(`${SCHEDULED_WORKOUT_ENDPOINT}/${workoutId}`);
  }

  async getMenstrualCalendar(startDate: string, endDate: string): Promise<unknown> {
    return this.request(`${MENSTRUAL_CALENDAR_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`);
  }

  async getMenstrualDataForDate(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${MENSTRUAL_DAYVIEW_ENDPOINT}/${resolvedDate}`);
  }

  async getPregnancySummary(): Promise<unknown> {
    return this.request(PREGNANCY_SNAPSHOT_ENDPOINT);
  }

  async getLifestyleLoggingData(date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(`${LIFESTYLE_LOGGING_ENDPOINT}/${resolvedDate}`);
  }

  async getAvailableBadges(): Promise<unknown> {
    return this.request(AVAILABLE_BADGES_ENDPOINT);
  }

  async getAdhocChallenges(): Promise<unknown> {
    return this.request(ADHOC_CHALLENGES_ENDPOINT);
  }

  async getBadgeChallenges(): Promise<unknown> {
    return this.request(BADGE_CHALLENGES_ENDPOINT);
  }

  async getAvailableBadgeChallenges(): Promise<unknown> {
    return this.request(AVAILABLE_BADGE_CHALLENGES_ENDPOINT);
  }

  async getNonCompletedBadgeChallenges(): Promise<unknown> {
    return this.request(NON_COMPLETED_BADGE_CHALLENGES_ENDPOINT);
  }

  async getInProgressVirtualChallenges(): Promise<unknown> {
    return this.request(INPROGRESS_VIRTUAL_CHALLENGES_ENDPOINT);
  }

  async getGearActivities(gearUuid: string, start = 0, limit = DEFAULT_GEAR_ACTIVITIES_LIMIT): Promise<unknown> {
    return this.request(`${GEAR_ACTIVITIES_ENDPOINT}/${gearUuid}/gear?start=${start}&limit=${limit}`);
  }

  async getGearDefaults(): Promise<unknown> {
    return this.request(`${GEAR_DEFAULTS_ENDPOINT}/${this.userProfilePk}/activityTypes`);
  }

  async getSleepDataRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getSleepData(d));
  }

  async getHRVRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getHRV(d));
  }

  async getStressRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getStress(d));
  }

  async getSpO2Range(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getSpO2(d));
  }

  async getRespirationRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getRespiration(d));
  }

  async getTrainingReadinessRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getTrainingReadiness(d));
  }

  async getVO2MaxRange(startDate: string, endDate: string): Promise<{ date: string; data: unknown }[]> {
    return this.fetchRange(startDate, endDate, (d) => this.getVO2Max(d));
  }

  async getDailyHealthSnapshot(date?: string): Promise<Record<string, unknown>> {
    const resolvedDate = date ?? todayString();

    const [summary, heartRate, stress, bodyBattery, sleep, hrv, respiration, spo2, steps, floors, intensityMinutes] =
      await Promise.all([
        this.getDailySummary(resolvedDate).catch(() => null),
        this.getHeartRate(resolvedDate).catch(() => null),
        this.getStress(resolvedDate).catch(() => null),
        this.getBodyBattery(resolvedDate, resolvedDate).catch(() => null),
        this.getSleepData(resolvedDate).catch(() => null),
        this.getHRV(resolvedDate).catch(() => null),
        this.getRespiration(resolvedDate).catch(() => null),
        this.getSpO2(resolvedDate).catch(() => null),
        this.getStepsChart(resolvedDate).catch(() => null),
        this.getFloors(resolvedDate).catch(() => null),
        this.getIntensityMinutes(resolvedDate).catch(() => null),
      ]);

    return {
      date: resolvedDate,
      summary,
      heartRate,
      stress,
      bodyBattery,
      sleep,
      hrv,
      respiration,
      spo2,
      steps,
      floors,
      intensityMinutes,
    };
  }

  async setActivityName(activityId: number, name: string): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}`, {
      method: 'PUT',
      body: { activityName: name },
    });
  }

  async createManualActivity(payload: {
    activityName: string;
    activityTypeKey: string;
    startTimeInGMT: string;
    elapsedDurationInSecs: number;
    distanceInMeters?: number;
  }): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/manual`, {
      method: 'POST',
      body: payload,
    });
  }

  async deleteActivity(activityId: number): Promise<unknown> {
    return this.request(`${ACTIVITY_ENDPOINT}/${activityId}`, {
      method: 'DELETE',
    });
  }

  async addWeighIn(weight: number, unitKey = 'kg', date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(ADD_WEIGH_IN_ENDPOINT, {
      method: 'POST',
      body: {
        dateTimestamp: `${resolvedDate}T00:00:00.0`,
        gmtTimestamp: `${resolvedDate}T00:00:00.0`,
        unitKey,
        value: weight,
      },
    });
  }

  async setHydration(valueMl: number, date?: string): Promise<unknown> {
    const resolvedDate = date ?? todayString();
    return this.request(SET_HYDRATION_ENDPOINT, {
      method: 'PUT',
      body: {
        calendarDate: resolvedDate,
        valueInML: valueMl,
        timestampLocal: `${resolvedDate}T00:00:00.0`,
      },
    });
  }

  async setBloodPressure(
    systolic: number,
    diastolic: number,
    pulse: number,
    timestamp?: string,
    notes?: string,
  ): Promise<unknown> {
    const ts = timestamp ?? new Date().toISOString();
    return this.request(SET_BLOOD_PRESSURE_ENDPOINT, {
      method: 'POST',
      body: {
        systolic,
        diastolic,
        pulse,
        measurementTimestampGMT: ts,
        notes: notes ?? null,
        sourceType: 'manual',
      },
    });
  }

  async addGearToActivity(gearUuid: string, activityId: number): Promise<unknown> {
    return this.request(
      `${GEAR_LINK_ENDPOINT}/${gearUuid}/activity/${activityId}`,
      { method: 'PUT' },
    );
  }

  async removeGearFromActivity(gearUuid: string, activityId: number): Promise<unknown> {
    return this.request(
      `${GEAR_UNLINK_ENDPOINT}/${gearUuid}/activity/${activityId}`,
      { method: 'PUT' },
    );
  }
}
