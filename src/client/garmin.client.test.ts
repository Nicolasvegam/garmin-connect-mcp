import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import dotenv from 'dotenv';
import { GarminClient } from './garmin.client';

dotenv.config();

const email = process.env.GARMIN_EMAIL!;
const password = process.env.GARMIN_PASSWORD!;

const DELAY_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function yesterday(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split('T')[0]!;
}

function weekAgo(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return now.toISOString().split('T')[0]!;
}

function monthAgo(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return now.toISOString().split('T')[0]!;
}

describe('GarminClient (live API)', () => {
  let client: GarminClient;

  beforeAll(() => {
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();
    client = new GarminClient(email, password);
  });

  afterEach(() => sleep(DELAY_MS));

  describe('Activities', () => {
    it('get_activities', async () => {
      const data = await client.getActivities(0, 5);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, 30000);

    it('get_activities_by_date', async () => {
      const data = await client.getActivitiesByDate(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_last_activity', async () => {
      const data = await client.getLastActivity();
      expect(data).toBeDefined();
    }, 30000);

    it('count_activities', async () => {
      const data = await client.countActivities();
      expect(data).toBeDefined();
    }, 30000);

    it('get_activity (first from list)', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivity(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_details', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityDetails(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_splits', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivitySplits(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_weather', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityWeather(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_hr_zones', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityHrZones(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_exercise_sets', async () => {
      const activities = await client.getActivities(0, 1) as { activityId: number }[];
      if (activities.length > 0) {
        await sleep(DELAY_MS);
        const data = await client.getActivityExerciseSets(activities[0]!.activityId);
        expect(data).toBeDefined();
      }
    }, 30000);

    it('get_activity_types', async () => {
      const data = await client.getActivityTypes();
      expect(data).toBeDefined();
    }, 30000);

    it('get_progress_summary', async () => {
      const data = await client.getProgressSummary(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Daily Health', () => {
    it('get_daily_summary', async () => {
      const data = await client.getDailySummary(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_steps', async () => {
      const data = await client.getSteps(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_steps_chart', async () => {
      const data = await client.getStepsChart(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_heart_rate', async () => {
      const data = await client.getHeartRate(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_resting_heart_rate', async () => {
      const data = await client.getRestingHeartRate(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_stress', async () => {
      const data = await client.getStress(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_body_battery', async () => {
      const data = await client.getBodyBattery(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_body_battery_events', async () => {
      const data = await client.getBodyBatteryEvents(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_respiration', async () => {
      const data = await client.getRespiration(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_spo2', async () => {
      const data = await client.getSpO2(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_intensity_minutes', async () => {
      const data = await client.getIntensityMinutes(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_floors', async () => {
      const data = await client.getFloors(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hydration', async () => {
      const data = await client.getHydration(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_daily_events', async () => {
      const data = await client.getDailyEvents(yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Trends', () => {
    it('get_daily_steps_range', async () => {
      const data = await client.getDailySteps(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_steps', async () => {
      const data = await client.getWeeklySteps(yesterday(), 4);
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_stress', async () => {
      const data = await client.getWeeklyStress(yesterday(), 4);
      expect(data).toBeDefined();
    }, 30000);

    it('get_weekly_intensity_minutes', async () => {
      const data = await client.getWeeklyIntensityMinutes(weekAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Sleep', () => {
    it('get_sleep_data', async () => {
      const data = await client.getSleepData(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_sleep_data_raw', async () => {
      const data = await client.getSleepDataRaw(yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Body Composition', () => {
    it('get_body_composition', async () => {
      const data = await client.getBodyComposition(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_latest_weight', async () => {
      const data = await client.getLatestWeight();
      expect(data).toBeDefined();
    }, 30000);

    it('get_daily_weigh_ins', async () => {
      const data = await client.getDailyWeighIns(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_weigh_ins', async () => {
      const data = await client.getWeighIns(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_blood_pressure', async () => {
      const data = await client.getBloodPressure(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Performance & Training', () => {
    it('get_vo2max', async () => {
      const data = await client.getVO2Max(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_training_readiness', async () => {
      const data = await client.getTrainingReadiness(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_training_status', async () => {
      const data = await client.getTrainingStatus(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hrv', async () => {
      const data = await client.getHRV(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_endurance_score', async () => {
      const data = await client.getEnduranceScore(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_hill_score', async () => {
      const data = await client.getHillScore(monthAgo(), yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_race_predictions', async () => {
      const data = await client.getRacePredictions();
      expect(data).toBeDefined();
    }, 30000);

    it('get_fitness_age', async () => {
      const data = await client.getFitnessAge(yesterday());
      expect(data).toBeDefined();
    }, 30000);

    it('get_personal_records', async () => {
      const data = await client.getPersonalRecords();
      expect(data).toBeDefined();
    }, 30000);

    it('get_lactate_threshold', async () => {
      const data = await client.getLactateThreshold();
      expect(data).toBeDefined();
    }, 30000);

    it('get_cycling_ftp', async () => {
      const data = await client.getCyclingFTP();
      expect(data).toBeDefined();
    }, 30000);
  });

  describe('Profile & Devices', () => {
    it('get_user_profile', async () => {
      const data = await client.getUserProfile();
      expect(data).toBeDefined();
    }, 30000);

    it('get_user_settings', async () => {
      const data = await client.getUserSettings();
      expect(data).toBeDefined();
    }, 30000);

    it('get_devices', async () => {
      const data = await client.getDevices();
      expect(data).toBeDefined();
    }, 30000);

    it('get_device_last_used', async () => {
      const data = await client.getDeviceLastUsed();
      expect(data).toBeDefined();
    }, 30000);

    it('get_primary_training_device', async () => {
      const data = await client.getPrimaryTrainingDevice();
      expect(data).toBeDefined();
    }, 30000);

    it('get_gear', async () => {
      const data = await client.getGear();
      expect(data).toBeDefined();
    }, 30000);

    it('get_goals', async () => {
      const data = await client.getGoals();
      expect(data).toBeDefined();
    }, 30000);

    it('get_earned_badges', async () => {
      const data = await client.getEarnedBadges();
      expect(data).toBeDefined();
    }, 30000);

    it('get_workouts', async () => {
      const data = await client.getWorkouts();
      expect(data).toBeDefined();
    }, 30000);
  });
});
