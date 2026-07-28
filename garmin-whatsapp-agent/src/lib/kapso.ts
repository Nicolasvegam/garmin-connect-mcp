import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { KAPSO_META_PROXY, KAPSO_PLATFORM_API } from './env';
import { getKapsoConfig } from './store';

const TEXT_LIMIT = 4096;

function getClient(): { client: WhatsAppClient; phoneNumberId: string } {
  const cfg = getKapsoConfig();
  if (!cfg?.apiKey || !cfg.phoneNumberId) {
    throw new Error('Kapso is not configured yet. Complete the setup wizard first.');
  }
  const client = new WhatsAppClient({ baseUrl: KAPSO_META_PROXY, kapsoApiKey: cfg.apiKey });
  return { client, phoneNumberId: cfg.phoneNumberId };
}

function chunkText(text: string): string[] {
  if (text.length <= TEXT_LIMIT) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    let cut = Math.min(TEXT_LIMIT, rest.length);
    if (cut < rest.length) {
      const lastBreak = rest.lastIndexOf('\n', cut);
      if (lastBreak > TEXT_LIMIT / 2) cut = lastBreak;
    }
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return chunks;
}

export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { client, phoneNumberId } = getClient();
  for (const chunk of chunkText(body)) {
    await client.messages.sendText({ phoneNumberId, to, body: chunk });
  }
}

async function platformRequest<T>(apiKey: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${KAPSO_PLATFORM_API}${path}`, {
    ...init,
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Kapso API ${response.status} on ${path}: ${text.slice(0, 500)}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listPhoneNumbers(apiKey: string): Promise<unknown> {
  return platformRequest(apiKey, '/whatsapp/phone_numbers');
}

export async function createInboundWebhook(
  apiKey: string,
  phoneNumberId: string,
  url: string,
): Promise<unknown> {
  return platformRequest(apiKey, `/whatsapp/phone_numbers/${phoneNumberId}/webhooks`, {
    method: 'POST',
    body: JSON.stringify({
      webhook: {
        url,
        events: ['whatsapp.message.received'],
      },
    }),
  });
}
