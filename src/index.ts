import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

const TOKEN_DIR = path.join(os.homedir(), '.garmin-mcp');
const hasCachedTokens =
  fs.existsSync(path.join(TOKEN_DIR, 'oauth1_token.json')) &&
  fs.existsSync(path.join(TOKEN_DIR, 'oauth2_token.json'));

if ((!GARMIN_EMAIL || !GARMIN_PASSWORD) && !hasCachedTokens) {
  console.error(
    'Error: no cached tokens found and GARMIN_EMAIL/GARMIN_PASSWORD env vars not set.\n' +
      'Either run "npx @nicolasvegam/garmin-connect-mcp setup" to authenticate interactively,\n' +
      'or set env vars when adding this MCP server:\n' +
      '  claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y @nicolasvegam/garmin-connect-mcp',
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
