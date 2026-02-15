import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateParamSchema, getMenstrualCalendarSchema } from '../dtos';

export function registerWellnessTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_menstrual_calendar_data',
    {
      description: 'Get menstrual cycle calendar data for a date range: cycle phases, predictions, symptoms',
      inputSchema: getMenstrualCalendarSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getMenstrualCalendar(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_menstrual_data_for_date',
    {
      description: 'Get menstrual cycle day view for a specific date: current phase, symptoms, predictions',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getMenstrualDataForDate(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_pregnancy_summary',
    {
      description: 'Get pregnancy tracking summary data',
    },
    async () => {
      const data = await client.getPregnancySummary();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_lifestyle_logging_data',
    {
      description: 'Get daily lifestyle logging data for a date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getLifestyleLoggingData(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
