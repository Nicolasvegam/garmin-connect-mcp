import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './env';
import { decrypt, encrypt } from './crypto';

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export type AppConfig = {
  claude?: { token: string; savedAt: string };
  garmin?: { email: string; connected: boolean; connectedAt?: string };
  kapso?: {
    apiKey: string;
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    webhookSecret?: string;
    publicUrl?: string;
  };
  allowedNumbers?: string[];
  systemPrompt?: string;
};

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600 });
}

export function readConfig(): AppConfig {
  return readJson<AppConfig>(CONFIG_FILE, {});
}

export function updateConfig(patch: Partial<AppConfig>): AppConfig {
  const next = { ...readConfig(), ...patch };
  writeJson(CONFIG_FILE, next);
  return next;
}

export function setClaudeToken(token: string): void {
  updateConfig({ claude: { token: encrypt(token), savedAt: new Date().toISOString() } });
}

export function getClaudeToken(): string | null {
  const stored = readConfig().claude?.token;
  return stored ? decrypt(stored) : null;
}

export function setKapsoConfig(input: {
  apiKey: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  webhookSecret?: string;
  publicUrl?: string;
}): void {
  const current = readConfig().kapso;
  updateConfig({
    kapso: {
      apiKey: encrypt(input.apiKey),
      phoneNumberId: input.phoneNumberId ?? current?.phoneNumberId,
      displayPhoneNumber: input.displayPhoneNumber ?? current?.displayPhoneNumber,
      webhookSecret: input.webhookSecret ? encrypt(input.webhookSecret) : current?.webhookSecret,
      publicUrl: input.publicUrl ?? current?.publicUrl,
    },
  });
}

export function getKapsoConfig(): {
  apiKey: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  webhookSecret?: string;
  publicUrl?: string;
} | null {
  const stored = readConfig().kapso;
  if (!stored?.apiKey) return null;
  return {
    ...stored,
    apiKey: decrypt(stored.apiKey),
    webhookSecret: stored.webhookSecret ? decrypt(stored.webhookSecret) : undefined,
  };
}

export function getSessions(): Record<string, string> {
  return readJson<Record<string, string>>(SESSIONS_FILE, {});
}

export function saveSession(conversationKey: string, sessionId: string): void {
  const sessions = getSessions();
  sessions[conversationKey] = sessionId;
  writeJson(SESSIONS_FILE, sessions);
}

export function clearSession(conversationKey: string): void {
  const sessions = getSessions();
  delete sessions[conversationKey];
  writeJson(SESSIONS_FILE, sessions);
}
