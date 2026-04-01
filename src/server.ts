import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

export function registerAllGarminTools(server: McpServer): void {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      'Error: GARMIN_EMAIL and GARMIN_PASSWORD environment variables are required.\n' +
        'Set them when adding this MCP server:\n' +
        '  claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y @nicolasvegam/garmin-connect-mcp',
    );
    process.exit(1);
  }

  const client = new GarminClient(email, password);

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
}

export function createGarminServer(): McpServer {
  const server = new McpServer({
    name: 'garmin-connect-mcp',
    version: '1.0.0',
  });

  registerAllGarminTools(server);

  return server;
}
