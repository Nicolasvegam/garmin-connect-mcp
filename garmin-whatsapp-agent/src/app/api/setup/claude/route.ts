import { NextResponse } from 'next/server';
import { setClaudeToken } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Falta el token' }, { status: 400 });
  }
  if (!token.startsWith('sk-ant-oat')) {
    return NextResponse.json(
      { error: 'El token no parece un OAuth token de Claude (debe empezar con sk-ant-oat). Generalo con: claude setup-token' },
      { status: 400 },
    );
  }

  setClaudeToken(token);
  return NextResponse.json({ ok: true });
}
