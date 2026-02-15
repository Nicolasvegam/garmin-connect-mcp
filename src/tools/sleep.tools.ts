import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateParamSchema } from '../dtos';

export function registerSleepTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_sleep_data',
    {
      description:
        'Get detailed sleep data for a single night: duration, sleep stages (deep, light, REM, awake), sleep score, bed/wake times. For multiple nights use get_sleep_data_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getSleepData(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_sleep_data_raw',
    {
      description:
        'Get raw sleep data directly from the wellness service with full detail including heart rate and SpO2 during sleep',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getSleepDataRaw(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
