import { query } from '@anthropic-ai/claude-agent-sdk';
import { DATA_DIR } from '../lib/env';
import { getGarminClient } from '../lib/garmin-setup';
import { clearSession, getClaudeToken, getSessions, readConfig, saveSession } from '../lib/store';
import { buildGarminMcpServer } from './garmin-server';

const DEFAULT_SYSTEM_PROMPT = `Eres un asistente personal de fitness y salud conectado a los datos de Garmin Connect del usuario, conversando por WhatsApp.

Reglas:
- Responde en el idioma del usuario (por defecto español), en tono cercano y directo.
- Respuestas cortas y accionables, formato WhatsApp: sin markdown de encabezados, usa *negrita* y listas con guiones.
- Usa las herramientas de Garmin para responder con datos reales. Si un dia no tiene datos, prueba con el dia anterior.
- La fecha de hoy te la indica el sistema; para consultas relativas ("ayer", "esta semana") calcula las fechas en formato YYYY-MM-DD.
- Nunca inventes datos. Si una herramienta falla, dilo brevemente.`;

export async function runAgentTurn(conversationKey: string, userText: string): Promise<string> {
  const config = readConfig();
  const token = getClaudeToken();
  if (!token) return 'El agente no esta configurado todavia: falta el token de Claude en el wizard.';
  if (!config.garmin?.connected) return 'Garmin no esta conectado todavia. Completa el paso 2 del wizard.';

  const client = getGarminClient(config.garmin.email);
  const { server, allowedTools } = buildGarminMcpServer(client);

  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) env[key] = value;
  }
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  env.CLAUDE_CODE_OAUTH_TOKEN = token;

  const resume = getSessions()[conversationKey];
  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt = `${config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT}\n\nFecha de hoy: ${today}.`;

  let sessionId: string | undefined;
  let resultText = '';

  try {
    for await (const message of query({
      prompt: userText,
      options: {
        cwd: DATA_DIR,
        env,
        systemPrompt,
        tools: [],
        mcpServers: { garmin: server },
        allowedTools,
        maxTurns: 30,
        ...(resume ? { resume } : {}),
      },
    })) {
      if (message.type === 'system' && message.subtype === 'init') {
        sessionId = message.session_id;
      }
      if (message.type === 'result') {
        sessionId = message.session_id ?? sessionId;
        if (message.subtype === 'success') {
          resultText = message.result;
        } else {
          resultText = 'Tuve un problema procesando tu mensaje. Intenta de nuevo en un momento.';
          console.error('Agent result error:', message.subtype);
        }
      }
    }
  } catch (error: unknown) {
    if (resume) {
      clearSession(conversationKey);
      return runAgentTurn(conversationKey, userText);
    }
    throw error;
  }

  if (sessionId) saveSession(conversationKey, sessionId);
  return resultText || 'No tengo respuesta para eso. ¿Puedes reformular?';
}
