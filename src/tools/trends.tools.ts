import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateRangeParamSchema, weeklyParamSchema } from '../dtos';

export function registerTrendTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_daily_steps_range',
    {
      description: 'Get daily step counts over a date range for trend analysis',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getDailySteps(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_weekly_steps',
    {
      description: 'Get weekly aggregated step counts for trend analysis',
      inputSchema: weeklyParamSchema.shape,
    },
    async ({ endDate, weeks }) => {
      const data = await client.getWeeklySteps(endDate, weeks ?? 1);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_weekly_stress',
    {
      description: 'Get weekly aggregated stress data for trend analysis',
      inputSchema: weeklyParamSchema.shape,
    },
    async ({ endDate, weeks }) => {
      const data = await client.getWeeklyStress(endDate, weeks ?? 1);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_weekly_intensity_minutes',
    {
      description: 'Get weekly intensity minutes over a date range',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getWeeklyIntensityMinutes(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
