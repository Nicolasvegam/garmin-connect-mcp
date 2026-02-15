import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GarminClient } from './client';
import {
  registerActivityTools,
  registerHealthTools,
  registerTrendTools,
  registerSleepTools,
  registerBodyTools,
  registerPerformanceTools,
  registerProfileTools,
  registerRangeTools,
  registerSnapshotTools,
  registerTrainingTools,
  registerWellnessTools,
  registerChallengeTools,
  registerWriteTools,
} from './tools';

const GARMIN_EMAIL = process.env.GARMIN_EMAIL;
const GARMIN_PASSWORD = process.env.GARMIN_PASSWORD;

if (!GARMIN_EMAIL || !GARMIN_PASSWORD) {
  console.error(
    'Error: GARMIN_EMAIL and GARMIN_PASSWORD environment variables are required.\n' +
      'Set them when adding this MCP server:\n' +
      '  claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y garmin-connect-mcp',
  );
  process.exit(1);
}

const server = new McpServer({
  name: 'garmin-connect-mcp',
  version: '1.0.0',
});

const client = new GarminClient(GARMIN_EMAIL, GARMIN_PASSWORD);

registerActivityTools(server, client);
registerHealthTools(server, client);
registerTrendTools(server, client);
registerSleepTools(server, client);
registerBodyTools(server, client);
registerPerformanceTools(server, client);
registerProfileTools(server, client);
registerRangeTools(server, client);
registerSnapshotTools(server, client);
registerTrainingTools(server, client);
registerWellnessTools(server, client);
registerChallengeTools(server, client);
registerWriteTools(server, client);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Garmin Connect MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
