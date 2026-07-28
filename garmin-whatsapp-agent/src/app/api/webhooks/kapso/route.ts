import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { normalizeWebhook } from '@kapso/whatsapp-cloud-api/server';
import { enqueue, isDuplicate } from '../../../../agent/queue';
import { runAgentTurn } from '../../../../agent/runtime';
import { sendWhatsAppText } from '../../../../lib/kapso';
import { getKapsoConfig, readConfig } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

function isValidSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const received = header.replace(/^sha256=/, '').trim();
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf-8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  if (challenge) return new Response(challenge, { status: 200 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const kapso = getKapsoConfig();

  if (kapso?.webhookSecret) {
    const header =
      request.headers.get('x-webhook-signature') ?? request.headers.get('x-hub-signature-256');
    if (!isValidSignature(rawBody, header, kapso.webhookSecret)) {
      console.error('Webhook rejected: invalid signature');
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  } else {
    console.error('Warning: webhook received without a configured secret, skipping verification');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const normalized = normalizeWebhook(payload);
  const allowedNumbers = readConfig().allowedNumbers ?? [];

  for (const message of normalized.messages) {
    const kapsoMeta = (message as { kapso?: { direction?: string } }).kapso;
    if (kapsoMeta?.direction && kapsoMeta.direction !== 'inbound') continue;

    const from = message.from;
    const messageId = message.id;
    if (!from || !messageId) continue;
    if (isDuplicate(messageId)) continue;

    if (allowedNumbers.length > 0) {
      const normalizedFrom = from.replace(/\D/g, '');
      const isAllowed = allowedNumbers.some((n) => n.replace(/\D/g, '') === normalizedFrom);
      if (!isAllowed) {
        console.error(`Ignoring message from non-allowed number ${from}`);
        continue;
      }
    }

    const text = (message as { text?: { body?: string } }).text?.body;
    if (message.type !== 'text' || !text) {
      enqueue(from, () => sendWhatsAppText(from, 'Por ahora solo entiendo mensajes de texto.'));
      continue;
    }

    enqueue(from, async () => {
      const reply = await runAgentTurn(from, text);
      await sendWhatsAppText(from, reply);
    });
  }

  return NextResponse.json({ received: true });
}
