import { NextResponse } from 'next/server';
import { getGarminSetupState, startGarminLogin } from '../../../../lib/garmin-setup';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return NextResponse.json(getGarminSetupState());
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan email o password' }, { status: 400 });
  }

  startGarminLogin(email, password);
  return NextResponse.json(getGarminSetupState());
}
