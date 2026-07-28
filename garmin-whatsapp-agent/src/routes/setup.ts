import { Hono } from 'hono';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { DATA_DIR } from '../lib/env';
import { getGarminSetupState, startGarminLogin, submitMfaCode } from '../lib/garmin-setup';
import { createInboundWebhook, listPhoneNumbers } from '../lib/kapso';
import { getClaudeToken, readConfig, setClaudeToken, setKapsoConfig, updateConfig } from '../lib/store';

export const setupRoutes = new Hono();

setupRoutes.get('/status', (c) => {
  const config = readConfig();
  return c.json({
    claude: Boolean(config.claude?.token),
    garmin: {
      connected: Boolean(config.garmin?.connected),
      email: config.garmin?.email ?? null,
      setup: getGarminSetupState(),
    },
    kapso: {
      configured: Boolean(config.kapso?.apiKey),
      phoneNumberId: config.kapso?.phoneNumberId ?? null,
      displayPhoneNumber: config.kapso?.displayPhoneNumber ?? null,
      publicUrl: config.kapso?.publicUrl ?? null,
      hasWebhookSecret: Boolean(config.kapso?.webhookSecret),
    },
    allowedNumbers: config.allowedNumbers ?? [],
  });
});

setupRoutes.post('/claude', async (c) => {
  const body = await c.req.json().catch(() => null) as { token?: string } | null;
  const token = body?.token?.trim();
  if (!token) return c.json({ error: 'Falta el token' }, 400);
  if (!token.startsWith('sk-ant-oat')) {
    return c.json(
      { error: 'El token no parece un OAuth token de Claude (debe empezar con sk-ant-oat). Generalo con: claude setup-token' },
      400,
    );
  }
  setClaudeToken(token);
  return c.json({ ok: true });
});

setupRoutes.post('/claude/test', async (c) => {
  const token = getClaudeToken();
  if (!token) return c.json({ error: 'Primero guarda el token' }, 400);

  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) env[key] = value;
  }
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  env.CLAUDE_CODE_OAUTH_TOKEN = token;

  try {
    let result = '';
    for await (const message of query({
      prompt: 'Responde exactamente: OK',
      options: { cwd: DATA_DIR, env, tools: [], maxTurns: 1 },
    })) {
      if (message.type === 'result' && message.subtype === 'success') {
        result = message.result;
      }
    }
    return c.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ error: `La prueba fallo: ${message}` }, 500);
  }
});

setupRoutes.get('/garmin', (c) => c.json(getGarminSetupState()));

setupRoutes.post('/garmin', async (c) => {
  const body = await c.req.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim();
  const password = body?.password;
  if (!email || !password) return c.json({ error: 'Faltan email o password' }, 400);
  startGarminLogin(email, password);
  return c.json(getGarminSetupState());
});

setupRoutes.post('/garmin/mfa', async (c) => {
  const body = await c.req.json().catch(() => null) as { code?: string } | null;
  const code = body?.code?.trim();
  if (!code) return c.json({ error: 'Falta el codigo MFA' }, 400);
  if (!submitMfaCode(code)) return c.json({ error: 'No hay un login esperando MFA' }, 409);
  return c.json(getGarminSetupState());
});

type KapsoSetupBody = {
  action?: 'list_numbers' | 'save' | 'create_webhook';
  apiKey?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  webhookSecret?: string;
  publicUrl?: string;
  allowedNumbers?: string[];
};

setupRoutes.post('/kapso', async (c) => {
  const body = await c.req.json().catch(() => null) as KapsoSetupBody | null;
  if (!body?.apiKey) return c.json({ error: 'Falta la API key de Kapso' }, 400);

  try {
    if (body.action === 'list_numbers') {
      const numbers = await listPhoneNumbers(body.apiKey);
      return c.json({ numbers });
    }

    if (body.action === 'create_webhook') {
      if (!body.phoneNumberId || !body.publicUrl) {
        return c.json({ error: 'Faltan phoneNumberId o publicUrl' }, 400);
      }
      const webhookUrl = `${body.publicUrl.replace(/\/$/, '')}/api/webhooks/kapso`;
      const result = await createInboundWebhook(body.apiKey, body.phoneNumberId, webhookUrl);
      const secret = extractSecret(result);
      setKapsoConfig({
        apiKey: body.apiKey,
        phoneNumberId: body.phoneNumberId,
        displayPhoneNumber: body.displayPhoneNumber,
        publicUrl: body.publicUrl,
        webhookSecret: secret ?? body.webhookSecret,
      });
      return c.json({ ok: true, webhookUrl, secretDetected: Boolean(secret), raw: result });
    }

    setKapsoConfig({
      apiKey: body.apiKey,
      phoneNumberId: body.phoneNumberId,
      displayPhoneNumber: body.displayPhoneNumber,
      publicUrl: body.publicUrl,
      webhookSecret: body.webhookSecret,
    });
    if (body.allowedNumbers) {
      updateConfig({ allowedNumbers: body.allowedNumbers.filter(Boolean) });
    }
    return c.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ error: message }, 502);
  }
});

function extractSecret(result: unknown): string | undefined {
  if (typeof result !== 'object' || result === null) return undefined;
  const record = result as Record<string, unknown>;
  const candidates = [record, record.webhook, record.data];
  for (const candidate of candidates) {
    if (typeof candidate === 'object' && candidate !== null) {
      const secret = (candidate as Record<string, unknown>).secret_key ??
        (candidate as Record<string, unknown>).secretKey ??
        (candidate as Record<string, unknown>).secret;
      if (typeof secret === 'string') return secret;
    }
  }
  return undefined;
}
