import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GarminClient } from '../client';
import {
  setActivityNameSchema,
  createManualActivitySchema,
  deleteActivitySchema,
  addWeighInSchema,
  setHydrationSchema,
  setBloodPressureSchema,
  gearActivitySchema,
  createWorkoutSchema,
  scheduleWorkoutSchema,
  deleteWorkoutSchema,
  unscheduleWorkoutSchema,
} from '../dtos';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function workoutLabel(workoutName: string | null | undefined, workoutId: string): string {
  return workoutName ? `"${workoutName}" (workout ${workoutId})` : `workout ${workoutId}`;
}

async function orNull<T>(lookup: () => Promise<T>): Promise<T | null> {
  try {
    return await lookup();
  } catch {
    return null;
  }
}

export function registerWriteTools(server: McpServer, client: GarminClient): void {
  server.registerTool(
    'set_activity_name',
    {
      description: 'Rename an activity',
      inputSchema: setActivityNameSchema.shape,
    },
    async ({ activityId, name }) => {
      const data = await client.setActivityName(activityId, name);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'create_manual_activity',
    {
      description:
        'Create a manual activity entry. Use get_activity_types to find valid activityTypeKey values',
      inputSchema: createManualActivitySchema.shape,
    },
    async ({ activityName, activityTypeKey, startTimeInGMT, elapsedDurationInSecs, distanceInMeters }) => {
      const data = await client.createManualActivity({
        activityName,
        activityTypeKey,
        startTimeInGMT,
        elapsedDurationInSecs,
        distanceInMeters,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'delete_activity',
    {
      description: 'Delete an activity permanently. This action cannot be undone',
      inputSchema: deleteActivitySchema.shape,
    },
    async ({ activityId }) => {
      const data = await client.deleteActivity(activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data ?? 'Activity deleted', null, 2) }],
      };
    },
  );

  server.registerTool(
    'add_weigh_in',
    {
      description: 'Record a weight measurement',
      inputSchema: addWeighInSchema.shape,
    },
    async ({ weight, unitKey, date }) => {
      const data = await client.addWeighIn(weight, unitKey ?? 'kg', date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'set_hydration',
    {
      description: 'Set daily hydration intake in milliliters',
      inputSchema: setHydrationSchema.shape,
    },
    async ({ valueMl, date }) => {
      const data = await client.setHydration(valueMl, date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'set_blood_pressure',
    {
      description: 'Record a blood pressure measurement with systolic, diastolic, and pulse',
      inputSchema: setBloodPressureSchema.shape,
    },
    async ({ systolic, diastolic, pulse, timestamp, notes }) => {
      const data = await client.setBloodPressure(systolic, diastolic, pulse, timestamp, notes);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'add_gear_to_activity',
    {
      description: 'Link a gear item (shoes, bike) to an activity',
      inputSchema: gearActivitySchema.shape,
    },
    async ({ gearUuid, activityId }) => {
      const data = await client.addGearToActivity(gearUuid, activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data ?? 'Gear linked', null, 2) }],
      };
    },
  );

  server.registerTool(
    'remove_gear_from_activity',
    {
      description: 'Unlink a gear item from an activity',
      inputSchema: gearActivitySchema.shape,
    },
    async ({ gearUuid, activityId }) => {
      const data = await client.removeGearFromActivity(gearUuid, activityId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data ?? 'Gear unlinked', null, 2) }],
      };
    },
  );

  server.registerTool(
    'create_workout',
    {
      description:
        'Create a workout (running by default) from steps that end after a duration or on a lap button press, each with an optional heart rate (bpm) or pace (m:ss per km) range, and optionally schedule it on a date. Steps can be grouped into repeats (e.g. 6 x interval + recovery), optionally dropping the final recovery. Returns the steps as Garmin stored them',
      inputSchema: createWorkoutSchema.shape,
    },
    async ({ name, sport, description, date, steps }) => {
      const created = await client.createWorkout({ name, sport, description, date, steps });
      if (!created.workoutId) {
        throw new Error(`Garmin did not return a workoutId for "${name}": ${JSON.stringify(created)}`);
      }
      const workoutId = String(created.workoutId);
      const label = workoutLabel(created.workoutName ?? name, workoutId);

      let workoutScheduleId: number | undefined;
      if (date) {
        try {
          const schedule = await client.scheduleWorkout(workoutId, date);
          workoutScheduleId = schedule.workoutScheduleId;
        } catch (error) {
          throw new Error(
            `${label} was created but scheduling it on ${date} failed: ${errorMessage(error)}. Retry with schedule_workout, or remove it with delete_workout`,
          );
        }
      }

      const result: Record<string, unknown> = {
        workoutId,
        workoutName: created.workoutName,
        description: created.description,
        scheduledDate: date ?? null,
        workoutScheduleId: workoutScheduleId === undefined ? null : String(workoutScheduleId),
      };

      try {
        result.steps = await client.getWorkoutStepSummary(workoutId);
      } catch (error) {
        result.steps = null;
        const scheduled = date ? ` and scheduled on ${date}` : '';
        result.readBackError = `${label} was created${scheduled}, but reading it back failed: ${errorMessage(error)}`;
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'schedule_workout',
    {
      description:
        'Schedule a saved workout on a calendar date. Returns the workoutScheduleId that unschedule_workout takes',
      inputSchema: scheduleWorkoutSchema.shape,
    },
    async ({ workoutId, date }) => {
      const schedule = await client.scheduleWorkout(workoutId, date);
      const result = {
        workoutId,
        workoutName: schedule.workout?.workoutName ?? null,
        date,
        workoutScheduleId: schedule.workoutScheduleId === undefined ? null : String(schedule.workoutScheduleId),
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'delete_workout',
    {
      description: 'Delete a saved workout permanently. This action cannot be undone',
      inputSchema: deleteWorkoutSchema.shape,
    },
    async ({ workoutId }) => {
      const workout = (await orNull(() => client.getWorkout(workoutId))) as { workoutName?: string } | null;
      try {
        await client.deleteWorkout(workoutId);
      } catch (error) {
        throw new Error(`Deleting ${workoutLabel(workout?.workoutName, workoutId)} failed: ${errorMessage(error)}`);
      }
      const result = { deleted: true, workoutId, workoutName: workout?.workoutName ?? null };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    'unschedule_workout',
    {
      description:
        'Remove a scheduled workout from the calendar. Takes the workoutScheduleId, not the workoutId. The workout itself is kept',
      inputSchema: unscheduleWorkoutSchema.shape,
    },
    async ({ scheduleId }) => {
      const schedule = (await orNull(() => client.getScheduledWorkout(scheduleId))) as {
        calendarDate?: string;
        workout?: { workoutId?: number; workoutName?: string };
      } | null;
      const workoutName = schedule?.workout?.workoutName ?? null;
      const date = schedule?.calendarDate ?? null;
      try {
        await client.unscheduleWorkout(scheduleId);
      } catch (error) {
        const what = workoutName ? `"${workoutName}"${date ? ` on ${date}` : ''}` : `schedule ${scheduleId}`;
        throw new Error(`Unscheduling ${what} failed: ${errorMessage(error)}`);
      }
      const result = {
        unscheduled: true,
        workoutScheduleId: scheduleId,
        workoutId: schedule?.workout?.workoutId === undefined ? null : String(schedule.workout.workoutId),
        workoutName,
        date,
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
