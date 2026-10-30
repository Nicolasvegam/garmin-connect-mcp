const CSRF_REGEX = /name="_csrf"\s+value="(.+?)"/;
const TICKET_REGEX = /ticket=([^"]+)"/;
const TITLE_REGEX = /<title>(.+?)<\/title>/;
const MFA_VAR_REGEX =
  /var\s+(customerGuid|mfaMethod|locale|clientId|codeSentTo)\s*=\s*["']([^"']*)["']\s*;/g;

export type SsoPage = {
  title: string;
  csrfToken: string | null;
  ticket: string | null;
  customerGuid: string | null;
  mfaMethod: string | null;
  locale: string | null;
  clientId: string | null;
  codeSentTo: string | null;
};

export type MfaChallenge = {
  csrfToken: string;
  requestCode: boolean;
  customerGuid: string;
  mfaMethod: string;
  locale: string;
  clientId: string;
};

export type SsoLoginResult =
  | { kind: 'ticket'; ticket: string }
  | { kind: 'mfa'; challenge: MfaChallenge }
  | { kind: 'missing-csrf' }
  | { kind: 'failure' };

function emptyToNull(value: string | undefined): string | null {
  if (!value) return null;
  return value;
}

export function parseSsoPage(html: string): SsoPage {
  const vars = new Map<string, string>();
  for (const match of html.matchAll(MFA_VAR_REGEX)) {
    const key = match[1];
    if (!key) continue;
    vars.set(key, match[2] ?? '');
  }

  return {
    title: TITLE_REGEX.exec(html)?.[1] ?? '',
    csrfToken: CSRF_REGEX.exec(html)?.[1] ?? null,
    ticket: TICKET_REGEX.exec(html)?.[1] ?? null,
    customerGuid: vars.get('customerGuid') ?? null,
    mfaMethod: emptyToNull(vars.get('mfaMethod')),
    locale: vars.get('locale') ?? null,
    clientId: vars.get('clientId') ?? null,
    codeSentTo: emptyToNull(vars.get('codeSentTo')),
  };
}

export function isMfaChallenge(page: SsoPage): boolean {
  const title = page.title.toLowerCase();
  if (title.includes('mfa')) return true;
  return title.includes('authentication application') && Boolean(page.mfaMethod);
}

export function shouldRequestMfaCode(page: SsoPage): boolean {
  const method = (page.mfaMethod ?? '').toLowerCase();
  if (method !== 'email' && method !== 'sms') return false;
  return !page.codeSentTo;
}

export function readSsoLogin(html: string): SsoLoginResult {
  const page = parseSsoPage(html);

  if (isMfaChallenge(page)) {
    if (!page.csrfToken) return { kind: 'missing-csrf' };
    return {
      kind: 'mfa',
      challenge: {
        csrfToken: page.csrfToken,
        requestCode: shouldRequestMfaCode(page),
        customerGuid: page.customerGuid ?? '',
        mfaMethod: page.mfaMethod ?? '',
        locale: page.locale ?? '',
        clientId: page.clientId ?? '',
      },
    };
  }

  if (page.ticket) return { kind: 'ticket', ticket: page.ticket };
  return { kind: 'failure' };
}
