import { Hono } from 'hono';
import { runAgentTurn } from '../agent/runtime';

export const chatRoutes = new Hono();

chatRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null) as
    | { text?: string; conversationId?: string }
    | null;
  const text = body?.text?.trim();
  if (!text) return c.json({ error: 'Falta el texto' }, 400);

  const conversationKey = `web:${body?.conversationId ?? 'default'}`;
  try {
    const reply = await runAgentTurn(conversationKey, text);
    return c.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ error: message }, 500);
  }
});
