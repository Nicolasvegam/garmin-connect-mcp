import { GarminClient } from '../garmin/client';
import { GARMIN_TOKEN_DIR } from './env';
import { updateConfig } from './store';

export type GarminSetupState = {
  status: 'idle' | 'authenticating' | 'pending_mfa' | 'connected' | 'error';
  error?: string;
};

type SetupSlot = {
  state: GarminSetupState;
  mfaResolve?: (code: string) => void;
};

function slot(): SetupSlot {
  const g = globalThis as { __garminSetup?: SetupSlot };
  g.__garminSetup ??= { state: { status: 'idle' } };
  return g.__garminSetup;
}

export function getGarminSetupState(): GarminSetupState {
  return slot().state;
}

export function submitMfaCode(code: string): boolean {
  const s = slot();
  if (s.state.status !== 'pending_mfa' || !s.mfaResolve) return false;
  s.state = { status: 'authenticating' };
  const resolve = s.mfaResolve;
  s.mfaResolve = undefined;
  resolve(code.trim());
  return true;
}

export function startGarminLogin(email: string, password: string): void {
  const s = slot();
  if (s.state.status === 'authenticating' || s.state.status === 'pending_mfa') return;
  s.state = { status: 'authenticating' };

  const promptMfa = (): Promise<string> =>
    new Promise<string>((resolve) => {
      s.state = { status: 'pending_mfa' };
      s.mfaResolve = resolve;
    });

  const client = new GarminClient(email, password, { tokenDir: GARMIN_TOKEN_DIR, promptMfa });

  void client
    .getActivities(0, 1)
    .then(() => {
      s.state = { status: 'connected' };
      updateConfig({ garmin: { email, connected: true, connectedAt: new Date().toISOString() } });
      resetGarminClient();
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      s.state = { status: 'error', error: message };
      s.mfaResolve = undefined;
    });
}

type ClientSlot = { client?: GarminClient };

function clientSlot(): ClientSlot {
  const g = globalThis as { __garminClient?: ClientSlot };
  g.__garminClient ??= {};
  return g.__garminClient;
}

export function resetGarminClient(): void {
  clientSlot().client = undefined;
}

export function getGarminClient(email: string): GarminClient {
  const s = clientSlot();
  s.client ??= new GarminClient(email, '', { tokenDir: GARMIN_TOKEN_DIR });
  return s.client;
}
