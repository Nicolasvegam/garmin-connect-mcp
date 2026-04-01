import { createMcpHandler } from 'mcp-handler';
import { registerAllGarminTools } from '../../../src/server';

export const runtime = 'nodejs';

const handler = createMcpHandler(
  (server) => {
    registerAllGarminTools(server);
  },
  {
    serverInfo: {
      name: 'garmin-connect-mcp',
      version: '1.0.0',
    },
  },
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE };
