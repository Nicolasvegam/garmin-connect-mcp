import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateRangeParamSchema } from '../dtos';

export function registerRangeTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_sleep_data_range',
    {
      description:
        'Get sleep data over a date range (day-by-day). Returns array of {date, data} records with sleep stages, score, duration',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getSleepDataRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_hrv_range',
    {
      description:
        'Get HRV data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getHRVRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_stress_range',
    {
      description:
        'Get daily stress data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getStressRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_spo2_range',
    {
      description:
        'Get SpO2 (blood oxygen) data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getSpO2Range(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_respiration_range',
    {
      description:
        'Get respiration data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getRespirationRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_training_readiness_range',
    {
      description:
        'Get Training Readiness data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getTrainingReadinessRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_vo2max_range',
    {
      description:
        'Get VO2 Max data over a date range (day-by-day). Returns array of {date, data} records',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getVO2MaxRange(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
