import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import {
  dateParamSchema,
  getRacePredictionsSchema,
  getLactateThresholdSchema,
  getScoreSchema,
} from '../dtos';

export function registerPerformanceTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_vo2max',
    {
      description:
        'Get VO2 Max estimate for a date (running and cycling). Data may not be available for today, use yesterday. For ranges use get_vo2max_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getVO2Max(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_training_readiness',
    {
      description:
        'Get Training Readiness score: combines sleep, recovery, training load and HRV. Data may not be available for today, use yesterday. For ranges use get_training_readiness_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getTrainingReadiness(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_training_status',
    {
      description:
        'Get Training Status: productive, maintaining, detraining, peaking, recovery, overreaching. Includes training load. Data may not be available for today',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getTrainingStatus(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_hrv',
    {
      description:
        'Get Heart Rate Variability (HRV) data. Key recovery indicator. Data may not be available for today, use yesterday. For ranges use get_hrv_range',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getHRV(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_endurance_score',
    {
      description:
        'Get Endurance Score. Single date: omit endDate. Date range: provide both with optional aggregation (daily/weekly/monthly)',
      inputSchema: getScoreSchema.shape,
    },
    async ({ startDate, endDate, aggregation }) => {
      const data = await client.getEnduranceScore(startDate, endDate, aggregation);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_hill_score',
    {
      description:
        'Get Hill Score. Single date: omit endDate. Date range: provide both with optional aggregation (daily/weekly/monthly)',
      inputSchema: getScoreSchema.shape,
    },
    async ({ startDate, endDate, aggregation }) => {
      const data = await client.getHillScore(startDate, endDate, aggregation);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_race_predictions',
    {
      description:
        'Get race time predictions for 5K, 10K, half marathon, and marathon. Omit dates for latest. Provide dates for historical (daily/monthly)',
      inputSchema: getRacePredictionsSchema.shape,
    },
    async ({ startDate, endDate, type }) => {
      const data = await client.getRacePredictions(startDate, endDate, type ?? 'daily');
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_fitness_age',
    {
      description: 'Get Garmin Fitness Age estimate based on fitness level, activity, and body metrics',
      inputSchema: dateParamSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getFitnessAge(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_personal_records',
    {
      description: 'Get personal records: longest run, fastest 5K/10K/half/full marathon, longest ride',
    },
    async () => {
      const data = await client.getPersonalRecords();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_lactate_threshold',
    {
      description:
        'Get lactate threshold data: HR and pace. Omit dates for latest. Provide dates for historical trend with aggregation (daily/weekly/monthly)',
      inputSchema: getLactateThresholdSchema.shape,
    },
    async ({ startDate, endDate, aggregation }) => {
      const data = await client.getLactateThreshold(startDate, endDate, aggregation ?? 'daily');
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_cycling_ftp',
    {
      description: 'Get latest Functional Threshold Power (FTP) for cycling',
    },
    async () => {
      const data = await client.getCyclingFTP();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
