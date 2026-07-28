import { NextResponse } from 'next/server';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { getClaudeToken } from '../../../../../lib/store';
import { DATA_DIR } from '../../../../../lib/env';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(): Promise<Response> {
  const token = getClaudeToken();
  if (!token) {
    return NextResponse.json({ error: 'Primero guarda el token' }, { status: 400 });
  }

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
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `La prueba fallo: ${message}` }, { status: 500 });
  }
}
