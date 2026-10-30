import { describe, expect, it } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GarminClient } from '../client';
import { registerHealthTools } from './health.tools';

type ToolHandler = (args: { date?: string }) => Promise<{ content: { type: string; text: string }[] }>;

describe('get_steps tool', () => {
  it('calls getStepsChart for the requested date', async () => {
    const calls: Array<{ method: string; date: string | undefined }> = [];
    const client = {
      getStepsChart: async (date?: string) => {
        calls.push({ method: 'getStepsChart', date });
        return { steps: 10 };
      },
      getDailySummary: async (date?: string) => {
        calls.push({ method: 'getDailySummary', date });
        return { steps: 99 };
      },
    } as unknown as GarminClient;

    const handlers = new Map<string, ToolHandler>();
    const server = {
      registerTool: (name: string, _config: unknown, handler: ToolHandler) => {
        handlers.set(name, handler);
      },
    } as unknown as McpServer;

    registerHealthTools(server, client);
    const result = await handlers.get('get_steps')!({ date: '2024-06-01' });

    expect(calls).toEqual([{ method: 'getStepsChart', date: '2024-06-01' }]);
    expect(result.content).toEqual([
      { type: 'text', text: JSON.stringify({ steps: 10 }, null, 2) },
    ]);
  });
});
