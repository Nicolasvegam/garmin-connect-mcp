import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { dateParamSchema } from '../dtos';

export function registerSnapshotTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_daily_health_snapshot',
    {
      description:
        'Get complete daily health snapshot in a single call: summary, heart rate, stress, body battery, sleep, HRV, respiration, SpO2, steps, floors, intensity minutes. Calls ~11 endpoints in parallel. Use yesterday if today has no data yet',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDailyHealthSnapshot(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
