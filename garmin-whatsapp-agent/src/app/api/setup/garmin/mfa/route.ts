import { NextResponse } from 'next/server';
import { getGarminSetupState, submitMfaCode } from '../../../../../lib/garmin-setup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code?.trim();

  if (!code) {
    return NextResponse.json({ error: 'Falta el codigo MFA' }, { status: 400 });
  }
  if (!submitMfaCode(code)) {
    return NextResponse.json({ error: 'No hay un login esperando MFA' }, { status: 409 });
  }
  return NextResponse.json(getGarminSetupState());
}
