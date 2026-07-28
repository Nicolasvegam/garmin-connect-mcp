import { NextResponse } from 'next/server';
import { getGarminSetupState } from '../../../../lib/garmin-setup';
import { readConfig } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const config = readConfig();
  return NextResponse.json({
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
}
