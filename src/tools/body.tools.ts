import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateParamSchema, dateRangeParamSchema } from '../dtos';

export function registerBodyTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_body_composition',
    {
      description:
        'Get body composition data over a date range: weight, BMI, body fat %, muscle mass, bone mass, body water %',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getBodyComposition(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_latest_weight',
    {
      description: 'Get the most recent weight entry',
    },
    async () => {
      const data = await client.getDailyWeighIns();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_daily_weigh_ins',
    {
      description: 'Get all weigh-in entries for a specific date',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDailyWeighIns(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_weigh_ins',
    {
      description: 'Get weigh-in records over a date range',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getWeighIns(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_blood_pressure',
    {
      description: 'Get blood pressure readings over a date range',
      inputSchema: dateRangeParamSchema.shape,
    },
    async ({ startDate, endDate }) => {
      const data = await client.getBloodPressure(startDate, endDate);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
