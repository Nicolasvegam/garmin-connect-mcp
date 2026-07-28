import { NextResponse } from 'next/server';
import { createInboundWebhook, listPhoneNumbers } from '../../../../lib/kapso';
import { setKapsoConfig, updateConfig } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

type KapsoSetupBody = {
  action?: 'list_numbers' | 'save' | 'create_webhook';
  apiKey?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string;
  webhookSecret?: string;
  publicUrl?: string;
  allowedNumbers?: string[];
};

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as KapsoSetupBody | null;
  if (!body?.apiKey) {
    return NextResponse.json({ error: 'Falta la API key de Kapso' }, { status: 400 });
  }

  try {
    if (body.action === 'list_numbers') {
      const numbers = await listPhoneNumbers(body.apiKey);
      return NextResponse.json({ numbers });
    }

    if (body.action === 'create_webhook') {
      if (!body.phoneNumberId || !body.publicUrl) {
        return NextResponse.json({ error: 'Faltan phoneNumberId o publicUrl' }, { status: 400 });
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
      return NextResponse.json({ ok: true, webhookUrl, secretDetected: Boolean(secret), raw: result });
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
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

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
