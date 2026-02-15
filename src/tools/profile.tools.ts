import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import {
  getDeviceSettingsSchema,
  getDeviceSolarSchema,
  getGearStatsSchema,
  getGearActivitiesSchema,
  getWorkoutSchema,
} from '../dtos';

export function registerProfileTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_user_profile',
    {
      description: 'Get user social profile: name, location, profile image, activity preferences, level',
    },
    async () => {
      const data = await client.getUserProfile();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_user_settings',
    {
      description:
        'Get user settings: measurement system, time/date format, sleep schedule, HR zones, hydration preferences',
    },
    async () => {
      const data = await client.getUserSettings();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_devices',
    {
      description: 'Get all registered Garmin devices: model, firmware, last sync',
    },
    async () => {
      const data = await client.getDevices();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_device_settings',
    {
      description: 'Get settings and configuration for a specific Garmin device',
      inputSchema: getDeviceSettingsSchema.shape,
    },
    async ({ deviceId }) => {
      const data = await client.getDeviceSettings(deviceId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_device_last_used',
    {
      description: 'Get the last used Garmin device info',
    },
    async () => {
      const data = await client.getDeviceLastUsed();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_primary_training_device',
    {
      description: 'Get the primary training device info',
    },
    async () => {
      const data = await client.getPrimaryTrainingDevice();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_device_solar_data',
    {
      description: 'Get solar charging data for solar-equipped Garmin devices',
      inputSchema: getDeviceSolarSchema.shape,
    },
    async ({ deviceId, startDate, endDate }) => {
      const data = await client.getDeviceSolarData(deviceId, startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_gear',
    {
      description: 'Get all gear/equipment: shoes, bikes, and other tracked equipment',
    },
    async () => {
      const data = await client.getGear();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_gear_stats',
    {
      description: 'Get usage statistics for a specific gear item (total distance, activities)',
      inputSchema: getGearStatsSchema.shape,
    },
    async ({ gearUuid }) => {
      const data = await client.getGearStats(gearUuid);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_goals',
    {
      description: 'Get active goals: step goals, activity goals, weight goals, and their progress',
    },
    async () => {
      const data = await client.getGoals();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_earned_badges',
    {
      description: 'Get all earned badges and achievements',
    },
    async () => {
      const data = await client.getEarnedBadges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_workouts',
    {
      description: 'Get saved workouts/training plans',
    },
    async () => {
      const data = await client.getWorkouts();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_workout',
    {
      description: 'Get a specific workout definition by ID',
      inputSchema: getWorkoutSchema.shape,
    },
    async ({ workoutId }) => {
      const data = await client.getWorkout(workoutId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_gear_activities',
    {
      description: 'Get activities associated with a specific gear item (e.g. runs with a specific pair of shoes)',
      inputSchema: getGearActivitiesSchema.shape,
    },
    async ({ gearUuid, start, limit }) => {
      const data = await client.getGearActivities(gearUuid, start ?? 0, limit ?? 20);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_gear_defaults',
    {
      description: 'Get default gear assignments per activity type',
    },
    async () => {
      const data = await client.getGearDefaults();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
