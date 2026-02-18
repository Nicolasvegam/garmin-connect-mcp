import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateParamSchema, dateRangeOptionalEndSchema } from '../dtos';

export function registerHealthTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_daily_summary',
    {
      description:
        'Get full daily summary: steps, calories, distance, floors, active minutes, heart rate, stress, body battery',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDailySummary(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_steps',
    {
      description: 'Get step count for a specific date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDailySummary(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_steps_chart',
    {
      description: 'Get detailed intraday step data throughout the day (step chart)',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getStepsChart(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_heart_rate',
    {
      description:
        'Get daily heart rate data: resting HR, max HR, min HR, and time series throughout the day',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getHeartRate(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_resting_heart_rate',
    {
      description: 'Get resting heart rate data for a specific date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getRestingHeartRate(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_stress',
    {
      description:
        'Get daily stress levels: overall score, time in rest/low/medium/high stress, and time series. Single date; for ranges use get_stress_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getStress(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_body_battery',
    {
      description:
        'Get Body Battery energy levels: charged, drained, highest, lowest. endDate defaults to startDate if omitted',
      inputSchema: dateRangeOptionalEndSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getBodyBattery(startDate, endDate ?? startDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_body_battery_events',
    {
      description: 'Get Body Battery charge and drain events for a day (what charged/drained your battery)',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getBodyBatteryEvents(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_respiration',
    {
      description: 'Get daily respiration rate data throughout the day. Single date; for ranges use get_respiration_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getRespiration(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_spo2',
    {
      description: 'Get blood oxygen saturation (SpO2) data for a specific date. Single date; for ranges use get_spo2_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getSpO2(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_intensity_minutes',
    {
      description: 'Get moderate and vigorous intensity minutes for a date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getIntensityMinutes(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_floors',
    {
      description: 'Get floors climbed chart data for a specific date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getFloors(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_hydration',
    {
      description: 'Get daily hydration data (water intake)',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getHydration(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_daily_events',
    {
      description: 'Get daily wellness events for a specific date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDailyEvents(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
