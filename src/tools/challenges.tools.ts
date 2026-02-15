import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';

export function registerChallengeTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_available_badges',
    {
      description: 'Get all available badges that can be earned',
    },
    async () => {
      const data = await client.getAvailableBadges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_adhoc_challenges',
    {
      description: 'Get historical ad-hoc challenges the user has participated in',
    },
    async () => {
      const data = await client.getAdhocChallenges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_badge_challenges',
    {
      description: 'Get completed badge challenges',
    },
    async () => {
      const data = await client.getBadgeChallenges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_available_badge_challenges',
    {
      description: 'Get available badge challenges that can be joined',
    },
    async () => {
      const data = await client.getAvailableBadgeChallenges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_non_completed_badge_challenges',
    {
      description: 'Get badge challenges that are started but not yet completed',
    },
    async () => {
      const data = await client.getNonCompletedBadgeChallenges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_inprogress_virtual_challenges',
    {
      description: 'Get virtual challenges currently in progress',
    },
    async () => {
      const data = await client.getInProgressVirtualChallenges();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
