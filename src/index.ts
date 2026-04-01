import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createGarminServer } from './server';

async function main(): Promise<void> {
  const server = createGarminServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Garmin Connect MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
