import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import type { GarminClient } from '../garmin/client';
import type { ToolConfig, ToolHandler, ToolRegistrar } from '../garmin/tools/registrar';
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
} from '../garmin/tools';

export type GarminMcpBundle = {
  server: ReturnType<typeof createSdkMcpServer>;
  allowedTools: string[];
};

export function buildGarminMcpServer(client: GarminClient): GarminMcpBundle {
  const tools: Array<ReturnType<typeof tool>> = [];
  const names: string[] = [];

  const registrar: ToolRegistrar = {
    registerTool(name: string, config: ToolConfig, handler: ToolHandler): void {
      names.push(name);
      tools.push(
        tool(name, config.description, config.inputSchema ?? {}, async (args: unknown) => {
          try {
            return await handler(args as any);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            return {
              content: [{ type: 'text' as const, text: `Garmin error: ${message}` }],
              isError: true,
            };
          }
        }),
      );
    },
  };

  registerActivityTools(registrar, client);
  registerHealthTools(registrar, client);
  registerTrendTools(registrar, client);
  registerSleepTools(registrar, client);
  registerBodyTools(registrar, client);
  registerPerformanceTools(registrar, client);
  registerProfileTools(registrar, client);
  registerRangeTools(registrar, client);
  registerSnapshotTools(registrar, client);
  registerTrainingTools(registrar, client);
  registerWellnessTools(registrar, client);
  registerChallengeTools(registrar, client);
  registerWriteTools(registrar, client);

  return {
    server: createSdkMcpServer({ name: 'garmin', version: '1.0.0', tools }),
    allowedTools: names.map((name) => `mcp__garmin__${name}`),
  };
}
