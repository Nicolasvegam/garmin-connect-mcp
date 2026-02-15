import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import {
  getActivitiesSchema,
  getActivitiesByDateSchema,
  getActivitySchema,
  getProgressSummarySchema,
} from '../dtos';
import { DEFAULT_ACTIVITIES_LIMIT } from '../constants/garmin-endpoints';

export function registerActivityTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_activities',
    {
      description:
        'Get recent activities with pagination. Returns activity summaries: type, duration, distance, calories, heart rate',
      inputSchema: getActivitiesSchema.shape,
    },
    async ({ start, limit, activityType }) => {
      const data = await client.getActivities(start ?? 0, limit ?? DEFAULT_ACTIVITIES_LIMIT, activityType);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activities_by_date',
    {
      description:
        'Search activities within a date range, optionally filtered by activity type (running, cycling, etc.)',
      inputSchema: getActivitiesByDateSchema.shape,
    },
    async ({ startDate, endDate, activityType }) => {
      const data = await client.getActivitiesByDate(startDate, endDate, activityType);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_last_activity',
    {
      description: 'Get the most recent activity',
    },
    async () => {
      const data = await client.getLastActivity();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'count_activities',
    {
      description: 'Get total number of activities',
    },
    async () => {
      const data = await client.countActivities();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity',
    {
      description: 'Get summary data for a specific activity',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivity(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_details',
    {
      description:
        'Get detailed activity metrics: HR, pace, elevation, cadence, power time series data',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityDetails(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_splits',
    {
      description: 'Get per-km or per-mile split data for an activity',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivitySplits(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_weather',
    {
      description:
        'Get weather conditions during an activity: temperature, humidity, wind, condition',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityWeather(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_hr_zones',
    {
      description: 'Get time spent in each heart rate zone during an activity',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityHrZones(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_exercise_sets',
    {
      description:
        'Get exercise set details for strength training activities: reps, weight, duration per set',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityExerciseSets(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_types',
    {
      description: 'Get all available activity types (running, cycling, swimming, etc.)',
    },
    async () => {
      const data = await client.getActivityTypes();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_gear',
    {
      description: 'Get gear/equipment used during a specific activity',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityGear(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_typed_splits',
    {
      description: 'Get typed split data for an activity (e.g. active vs rest intervals)',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityTypedSplits(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_split_summaries',
    {
      description: 'Get split summary data for an activity with aggregate stats per split',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivitySplitSummaries(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_activity_power_in_timezones',
    {
      description: 'Get power time in zones for cycling/running power activities',
      inputSchema: getActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.getActivityPowerInTimezones(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_progress_summary',
    {
      description:
        'Get fitness progress stats over a date range: distance, duration, or calories grouped by activity type',
      inputSchema: getProgressSummarySchema.shape,
    },
    async ({ startDate, endDate, metric }) => {
      const data = await client.getProgressSummary(startDate, endDate, metric ?? 'distance');
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
