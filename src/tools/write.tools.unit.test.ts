import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { GarminAuth, GarminClient, type RequestOptions } from '../client';
import { registerWriteTools } from './write.tools';

type Call = { endpoint: string; method: string; body?: unknown };
type StepBody = Record<string, unknown>;
type WorkoutBody = { sportType: unknown; workoutSegments: { workoutSteps: StepBody[] }[] } & Record<string, unknown>;

const WORKOUT_ID = 111;
const SCHEDULE_ID = 222;

function executableStep(stepOrder: number, kind: string, seconds: number, target: string, one: number | null, two: number | null) {
  return {
    type: 'ExecutableStepDTO',
    stepOrder,
    stepType: { stepTypeKey: kind, displayOrder: 3 },
    endCondition: { conditionTypeKey: 'time', displayOrder: 2, displayable: true },
    endConditionValue: seconds,
    targetType: { workoutTargetTypeKey: target, displayOrder: 4 },
    targetValueOne: one,
    targetValueTwo: two,
    zoneNumber: null,
  };
}

const HM_EFFORT_STEPS = [
  executableStep(1, 'warmup', 900, 'heart.rate.zone', 125, 149),
  executableStep(2, 'interval', 1200, 'pace.zone', 3.2258065, 2.9498525),
];

const STRIDES_STEPS = [
  {
    type: 'RepeatGroupDTO',
    stepOrder: 2,
    stepType: { stepTypeKey: 'repeat' },
    numberOfIterations: 4,
    endCondition: { conditionTypeKey: 'iterations' },
    endConditionValue: 4,
    workoutSteps: [
      executableStep(3, 'interval', 20, 'pace.zone', 4.1666667, 3.1746032),
      executableStep(4, 'recovery', 60, 'no.target', null, null),
    ],
  },
];

describe('workout write tools (stubbed HTTP)', () => {
  let calls: Call[];
  let failOn: ((call: Call) => boolean) | null;
  let storedSteps: unknown[];
  let mcp: Client;

  beforeEach(async () => {
    calls = [];
    failOn = null;
    storedSteps = HM_EFFORT_STEPS;

    vi.spyOn(GarminAuth.prototype, 'request').mockImplementation(
      async (endpoint: string, options?: RequestOptions) => {
        const call = { endpoint, method: (options?.method ?? 'GET').toUpperCase(), body: options?.body };
        calls.push(call);
        if (failOn?.(call)) throw new Error('boom');

        if (call.method === 'POST' && endpoint === '/workout-service/workout') {
          return { workoutId: WORKOUT_ID, workoutName: (call.body as { workoutName: string }).workoutName };
        }
        if (call.method === 'POST' && endpoint === `/workout-service/schedule/${WORKOUT_ID}`) {
          return { workoutScheduleId: SCHEDULE_ID, workout: { workoutId: WORKOUT_ID, workoutName: 'Base + HM effort' } };
        }
        if (call.method === 'GET' && endpoint === `/workout-service/workout/${WORKOUT_ID}`) {
          return { workoutId: WORKOUT_ID, workoutName: 'Base + HM effort', workoutSegments: [{ workoutSteps: storedSteps }] };
        }
        if (call.method === 'GET' && endpoint === `/workout-service/schedule/${SCHEDULE_ID}`) {
          return {
            workoutScheduleId: SCHEDULE_ID,
            calendarDate: '2026-10-13',
            workout: { workoutId: WORKOUT_ID, workoutName: 'Base + HM effort' },
          };
        }
        if (call.method === 'DELETE') return undefined;
        throw new Error(`Unexpected request ${call.method} ${endpoint}`);
      },
    );

    const server = new McpServer({ name: 'test', version: '0.0.0' });
    registerWriteTools(server, new GarminClient('nobody@example.com', 'x'));
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    mcp = new Client({ name: 'test-client', version: '0.0.0' });
    await Promise.all([server.connect(serverTransport), mcp.connect(clientTransport)]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function callTool(name: string, args: Record<string, unknown>) {
    const result = await mcp.callTool({ name, arguments: args });
    const text = (result.content as { type: string; text: string }[])[0]!.text;
    return { isError: Boolean(result.isError), text };
  }

  async function createdBody(args: Record<string, unknown>): Promise<WorkoutBody> {
    await callTool('create_workout', args);
    return calls.find((c) => c.method === 'POST' && c.endpoint === '/workout-service/workout')!.body as WorkoutBody;
  }

  async function createdStep(step: Record<string, unknown>): Promise<StepBody> {
    const body = await createdBody({ name: 'X', steps: [step] });
    return body.workoutSegments[0]!.workoutSteps[0]!;
  }

  describe('create_workout request body', () => {
    it('reproduces the payload proven against the live API', async () => {
      const body = await createdBody({
        name: 'Base',
        description: '...',
        steps: [{ kind: 'interval', durationSec: 2100, hr: [125, 149] }],
      });

      expect(body).toEqual({
        workoutName: 'Base',
        description: '...',
        sportType: { sportTypeId: 1, sportTypeKey: 'running' },
        workoutSegments: [
          {
            segmentOrder: 1,
            sportType: { sportTypeId: 1, sportTypeKey: 'running' },
            workoutSteps: [
              {
                type: 'ExecutableStepDTO',
                stepOrder: 1,
                stepType: { stepTypeId: 3, stepTypeKey: 'interval' },
                endCondition: { conditionTypeId: 2, conditionTypeKey: 'time' },
                endConditionValue: 2100,
                targetType: { workoutTargetTypeId: 4, workoutTargetTypeKey: 'heart.rate.zone' },
                targetValueOne: 125,
                targetValueTwo: 149,
              },
            ],
          },
        ],
      });
    });

    it('numbers steps in order and maps every step kind to its id', async () => {
      const body = await createdBody({
        name: 'All kinds',
        steps: [
          { kind: 'warmup', durationSec: 600 },
          { kind: 'interval', durationSec: 300 },
          { kind: 'recovery', durationSec: 120 },
          { kind: 'cooldown', durationSec: 600 },
        ],
      });
      const steps = body.workoutSegments[0]!.workoutSteps;

      expect(steps.map((s) => s.stepOrder)).toEqual([1, 2, 3, 4]);
      expect(steps.map((s) => s.stepType)).toEqual([
        { stepTypeId: 1, stepTypeKey: 'warmup' },
        { stepTypeId: 3, stepTypeKey: 'interval' },
        { stepTypeId: 4, stepTypeKey: 'recovery' },
        { stepTypeId: 2, stepTypeKey: 'cooldown' },
      ]);
    });

    it('omits description when none is given', async () => {
      const body = await createdBody({ name: 'X', steps: [{ kind: 'interval', durationSec: 60 }] });
      expect('description' in body).toBe(false);
    });

    it('sends the chosen sport type, defaulting to running', async () => {
      await createdBody({ name: 'A', steps: [{ kind: 'interval', durationSec: 60 }] });
      await createdBody({ name: 'B', sport: 'strength_training', steps: [{ kind: 'interval', durationSec: 60 }] });

      const posts = calls.filter((c) => c.endpoint === '/workout-service/workout' && c.method === 'POST');
      expect(posts.map((c) => (c.body as WorkoutBody).sportType)).toEqual([
        { sportTypeId: 1, sportTypeKey: 'running' },
        { sportTypeId: 5, sportTypeKey: 'strength_training' },
      ]);
    });

    it('ends an untilLapPress step on the lap button, with no end value', async () => {
      const step = await createdStep({ kind: 'warmup', untilLapPress: true, hr: [126, 152] });
      expect(step.endCondition).toEqual({ conditionTypeId: 1, conditionTypeKey: 'lap.button' });
      expect('endConditionValue' in step).toBe(false);
      expect([step.targetValueOne, step.targetValueTwo]).toEqual([126, 152]);
    });

    it('ends a step with durationSec on time', async () => {
      const step = await createdStep({ kind: 'warmup', durationSec: 600 });
      expect(step.endCondition).toEqual({ conditionTypeId: 2, conditionTypeKey: 'time' });
      expect(step.endConditionValue).toBe(600);
    });

    it.each([
      [{ kind: 'warmup' }],
      [{ kind: 'warmup', untilLapPress: false }],
      [{ kind: 'warmup', durationSec: 600, untilLapPress: true }],
    ])('rejects the step %j without exactly one end condition before calling Garmin', async (step) => {
      const { isError } = await callTool('create_workout', { name: 'Test', steps: [step] });
      expect(isError).toBe(true);
      expect(calls).toEqual([]);
    });

    it('builds no.target when neither hr nor pace is given', async () => {
      const step = await createdStep({ kind: 'recovery', durationSec: 60 });
      expect(step.targetType).toEqual({ workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' });
      expect('targetValueOne' in step).toBe(false);
    });

    it('puts the lower bpm in targetValueOne whatever the input order', async () => {
      const step = await createdStep({ kind: 'interval', durationSec: 60, hr: [149, 125] });
      expect(step.targetType).toEqual({ workoutTargetTypeId: 4, workoutTargetTypeKey: 'heart.rate.zone' });
      expect([step.targetValueOne, step.targetValueTwo]).toEqual([125, 149]);
    });

    it.each([
      [['5:10', '5:39']],
      [['5:39', '5:10']],
    ])('builds pace.zone with the faster speed in targetValueOne, input %j', async (pace) => {
      const step = await createdStep({ kind: 'interval', durationSec: 60, pace });
      expect(step.targetType).toEqual({ workoutTargetTypeId: 6, workoutTargetTypeKey: 'pace.zone' });
      expect(step.targetValueOne).toBeCloseTo(3.2258065, 6);
      expect(step.targetValueTwo).toBeCloseTo(2.9498525, 6);
    });

    it('builds a repeat group with step order running through it, as Garmin stores it', async () => {
      const body = await createdBody({
        name: 'Intervals',
        steps: [
          { kind: 'warmup', durationSec: 600 },
          {
            repeat: 6,
            skipLastRecovery: true,
            steps: [
              { kind: 'interval', durationSec: 120, pace: ['4:39', '5:05'] },
              { kind: 'recovery', durationSec: 120 },
            ],
          },
          { kind: 'cooldown', durationSec: 600 },
        ],
      });
      const [warmup, group, cooldown] = body.workoutSegments[0]!.workoutSteps;

      expect(warmup!.stepOrder).toBe(1);
      expect('childStepId' in warmup!).toBe(false);
      expect(group).toEqual({
        type: 'RepeatGroupDTO',
        stepOrder: 2,
        childStepId: 1,
        stepType: { stepTypeId: 6, stepTypeKey: 'repeat' },
        numberOfIterations: 6,
        endCondition: { conditionTypeId: 7, conditionTypeKey: 'iterations' },
        endConditionValue: 6,
        smartRepeat: false,
        skipLastRestStep: true,
        workoutSteps: [
          expect.objectContaining({ stepOrder: 3, childStepId: 1, stepType: { stepTypeId: 3, stepTypeKey: 'interval' } }),
          expect.objectContaining({
            stepOrder: 4,
            childStepId: 1,
            stepType: { stepTypeId: 4, stepTypeKey: 'recovery' },
            targetType: { workoutTargetTypeId: 1, workoutTargetTypeKey: 'no.target' },
          }),
        ],
      });
      expect(cooldown!.stepOrder).toBe(5);
    });

    it('numbers each repeat group and keeps the last recovery by default', async () => {
      const body = await createdBody({
        name: 'Two sets',
        steps: [
          { repeat: 3, steps: [{ kind: 'interval', durationSec: 20 }, { kind: 'recovery', durationSec: 60 }] },
          { repeat: 2, steps: [{ kind: 'interval', durationSec: 300 }] },
        ],
      });
      const groups = body.workoutSegments[0]!.workoutSteps;

      expect(groups.map((g) => [g.stepOrder, g.childStepId, g.skipLastRestStep])).toEqual([
        [1, 1, false],
        [4, 2, false],
      ]);
      expect((groups[1]!.workoutSteps as StepBody[]).map((s) => [s.stepOrder, s.childStepId])).toEqual([[5, 2]]);
    });

    it.each([
      [{ repeat: 3, skipLastRecovery: true, steps: [{ kind: 'interval', durationSec: 60 }] }],
      [{ repeat: 0, steps: [{ kind: 'interval', durationSec: 60 }] }],
      [{ repeat: 3, steps: [] }],
      [{ repeat: 2, steps: [{ repeat: 2, steps: [{ kind: 'interval', durationSec: 60 }] }] }],
    ])('rejects the invalid repeat group %j before calling Garmin', async (group) => {
      const { isError } = await callTool('create_workout', { name: 'Test', steps: [group] });
      expect(isError).toBe(true);
      expect(calls).toEqual([]);
    });

    it('rejects a step with both hr and pace before calling Garmin', async () => {
      const { isError } = await callTool('create_workout', {
        name: 'Test',
        steps: [{ kind: 'interval', durationSec: 60, hr: [125, 149], pace: ['5:10', '5:39'] }],
      });
      expect(isError).toBe(true);
      expect(calls).toEqual([]);
    });

    it.each(['5.30', '0:30', '5:60'])('rejects the malformed pace %s before calling Garmin', async (bad) => {
      const { isError } = await callTool('create_workout', {
        name: 'Test',
        steps: [{ kind: 'interval', durationSec: 60, pace: [bad, '5:39'] }],
      });
      expect(isError).toBe(true);
      expect(calls).toEqual([]);
    });
  });

  describe('create_workout flow', () => {
    it('creates, schedules and reads back in that order', async () => {
      const { isError, text } = await callTool('create_workout', {
        name: 'Base + HM effort',
        date: '2026-10-13',
        steps: [{ kind: 'interval', durationSec: 1200, pace: ['5:39', '5:10'] }],
      });

      expect(isError).toBe(false);
      expect(calls.map((c) => `${c.method} ${c.endpoint}`)).toEqual([
        'POST /workout-service/workout',
        `POST /workout-service/schedule/${WORKOUT_ID}`,
        `GET /workout-service/workout/${WORKOUT_ID}`,
      ]);
      expect(calls[1]!.body).toEqual({ date: '2026-10-13' });

      const result = JSON.parse(text);
      expect(result.workoutId).toBe(String(WORKOUT_ID));
      expect(result.workoutScheduleId).toBe(String(SCHEDULE_ID));
      expect(result.scheduledDate).toBe('2026-10-13');
      expect(result.steps).toEqual([
        {
          stepOrder: 1,
          kind: 'warmup',
          endCondition: 'time',
          endConditionValue: 900,
          target: 'heart.rate.zone',
          targetValueOne: 125,
          targetValueTwo: 149,
          bpm: [125, 149],
        },
        {
          stepOrder: 2,
          kind: 'interval',
          endCondition: 'time',
          endConditionValue: 1200,
          target: 'pace.zone',
          targetValueOne: 3.2258065,
          targetValueTwo: 2.9498525,
          pace: ['5:10', '5:39'],
        },
      ]);
    });

    it('reads back repeat groups and no.target steps', async () => {
      storedSteps = STRIDES_STEPS;
      const { text } = await callTool('create_workout', { name: 'X', steps: [{ kind: 'interval', durationSec: 60 }] });
      const [group] = JSON.parse(text).steps;

      expect(group.iterations).toBe(4);
      expect(group.skipLastRecovery).toBe(false);
      expect(group.steps.map((s: { pace?: string[]; target: string }) => s.pace ?? s.target)).toEqual([
        ['4:00', '5:15'],
        'no.target',
      ]);
    });

    it('does not schedule when no date is given', async () => {
      const { isError, text } = await callTool('create_workout', {
        name: 'Test',
        steps: [{ kind: 'interval', durationSec: 60 }],
      });

      expect(isError).toBe(false);
      expect(calls.map((c) => c.method)).toEqual(['POST', 'GET']);
      expect(JSON.parse(text).workoutScheduleId).toBeNull();
    });

    it('names the created workout and date when scheduling fails', async () => {
      failOn = (c) => c.endpoint.startsWith('/workout-service/schedule/');
      const { isError, text } = await callTool('create_workout', {
        name: 'Base + HM effort',
        date: '2026-10-13',
        steps: [{ kind: 'interval', durationSec: 60 }],
      });

      expect(isError).toBe(true);
      expect(text).toContain(`"Base + HM effort" (workout ${WORKOUT_ID}) was created but scheduling it on 2026-10-13 failed`);
    });

    it('still returns the ids, with the name, when the read-back fails', async () => {
      failOn = (c) => c.method === 'GET';
      const { isError, text } = await callTool('create_workout', {
        name: 'Base + HM effort',
        date: '2026-10-13',
        steps: [{ kind: 'interval', durationSec: 60 }],
      });

      expect(isError).toBe(false);
      const result = JSON.parse(text);
      expect(result.workoutScheduleId).toBe(String(SCHEDULE_ID));
      expect(result.steps).toBeNull();
      expect(result.readBackError).toContain(
        `"Base + HM effort" (workout ${WORKOUT_ID}) was created and scheduled on 2026-10-13, but reading it back failed: boom`,
      );
    });
  });

  describe('schedule, delete, unschedule', () => {
    it('schedules an existing workout and names it in the result', async () => {
      const { isError, text } = await callTool('schedule_workout', { workoutId: String(WORKOUT_ID), date: '2026-10-13' });

      expect(isError).toBe(false);
      expect(calls).toEqual([
        { endpoint: `/workout-service/schedule/${WORKOUT_ID}`, method: 'POST', body: { date: '2026-10-13' } },
      ]);
      expect(JSON.parse(text)).toEqual({
        workoutId: String(WORKOUT_ID),
        workoutName: 'Base + HM effort',
        date: '2026-10-13',
        workoutScheduleId: String(SCHEDULE_ID),
      });
    });

    it('looks up the name, then deletes the workout', async () => {
      const { isError, text } = await callTool('delete_workout', { workoutId: String(WORKOUT_ID) });

      expect(isError).toBe(false);
      expect(calls.map((c) => `${c.method} ${c.endpoint}`)).toEqual([
        `GET /workout-service/workout/${WORKOUT_ID}`,
        `DELETE /workout-service/workout/${WORKOUT_ID}`,
      ]);
      expect(JSON.parse(text)).toEqual({ deleted: true, workoutId: String(WORKOUT_ID), workoutName: 'Base + HM effort' });
    });

    it('still deletes when the name lookup fails', async () => {
      failOn = (c) => c.method === 'GET';
      const { isError, text } = await callTool('delete_workout', { workoutId: String(WORKOUT_ID) });

      expect(isError).toBe(false);
      expect(JSON.parse(text).workoutName).toBeNull();
    });

    it('looks up the name and date, then unschedules', async () => {
      const { isError, text } = await callTool('unschedule_workout', { scheduleId: String(SCHEDULE_ID) });

      expect(isError).toBe(false);
      expect(calls.map((c) => `${c.method} ${c.endpoint}`)).toEqual([
        `GET /workout-service/schedule/${SCHEDULE_ID}`,
        `DELETE /workout-service/schedule/${SCHEDULE_ID}`,
      ]);
      expect(JSON.parse(text)).toEqual({
        unscheduled: true,
        workoutScheduleId: String(SCHEDULE_ID),
        workoutId: String(WORKOUT_ID),
        workoutName: 'Base + HM effort',
        date: '2026-10-13',
      });
    });

    it('names the workout and date when unscheduling fails', async () => {
      failOn = (c) => c.method === 'DELETE';
      const { isError, text } = await callTool('unschedule_workout', { scheduleId: String(SCHEDULE_ID) });

      expect(isError).toBe(true);
      expect(text).toContain('Unscheduling "Base + HM effort" on 2026-10-13 failed');
    });
  });
});
