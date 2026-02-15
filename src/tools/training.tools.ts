import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import { getTrainingPlanSchema, getScheduledWorkoutSchema } from '../dtos';

export function registerTrainingTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'get_training_plans',
    {
      description: 'Get all training plans from Garmin Coach or custom plans',
    },
    async () => {
      const data = await client.getTrainingPlans();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_training_plan_by_id',
    {
      description: 'Get a specific training plan by ID with full schedule and workout details',
      inputSchema: getTrainingPlanSchema.shape,
    },
    async ({ planId }) => {
      const data = await client.getTrainingPlan(planId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_adaptive_training_plan_by_id',
    {
      description: 'Get an adaptive (Garmin Coach) training plan by ID',
      inputSchema: getTrainingPlanSchema.shape,
    },
    async ({ planId }) => {
      const data = await client.getAdaptiveTrainingPlan(planId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_scheduled_workout_by_id',
    {
      description: 'Get a specific scheduled workout by ID from a training plan',
      inputSchema: getScheduledWorkoutSchema.shape,
    },
    async ({ workoutId }) => {
      const data = await client.getScheduledWorkout(workoutId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
