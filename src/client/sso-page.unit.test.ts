import { describe, expect, it } from 'vitest';
import { parseSsoPage, readSsoLogin } from './sso-page';

function mfaPage(title: string, mfaMethod: string, codeSentTo?: string): string {
  const vars = [
    'var customerGuid = "cg-123";',
    `var mfaMethod = "${mfaMethod}";`,
    'var locale = "en-US";',
    'var clientId = "GarminConnect";',
  ];
  if (codeSentTo !== undefined) {
    vars.push(`var codeSentTo = "${codeSentTo}";`);
  }
  return `<html><head><title>${title}</title></head><body><input name="_csrf" value="csrf-1" />
<script>${vars.join(' ')}</script></body></html>`;
}

describe('SSO login page', () => {
  it('treats an authenticator MFA title as a challenge and does not request a code', () => {
    const result = readSsoLogin(mfaPage('Enter MFA code for login', 'totp'));
    expect(result).toEqual({
      kind: 'mfa',
      challenge: {
        csrfToken: 'csrf-1',
        requestCode: false,
        customerGuid: 'cg-123',
        mfaMethod: 'totp',
        locale: 'en-US',
        clientId: 'GarminConnect',
      },
    });
  });

  it('treats the email MFA title as a challenge and requests a code when none was sent', () => {
    const result = readSsoLogin(mfaPage('GARMIN Authentication Application', 'email'));
    expect(result.kind).toBe('mfa');
    if (result.kind !== 'mfa') return;
    expect(result.challenge.requestCode).toBe(true);
    expect(result.challenge.mfaMethod).toBe('email');
  });

  it('does not request another code when Garmin already sent one', () => {
    const result = readSsoLogin(
      mfaPage('GARMIN Authentication Application', 'sms', 'user@example.com'),
    );
    expect(result.kind).toBe('mfa');
    if (result.kind !== 'mfa') return;
    expect(result.challenge.requestCode).toBe(false);
  });

  it('does not treat the bare sign-in page as MFA', () => {
    const html =
      '<html><head><title>GARMIN Authentication Application</title></head><body><input name="_csrf" value="csrf-1" /></body></html>';
    expect(readSsoLogin(html)).toEqual({ kind: 'failure' });
  });

  it('extracts a service ticket from a successful login page', () => {
    const html =
      '<html><head><title>Success</title></head><body>service=https://sso.garmin.com/sso/embed?ticket=ST-123"</body></html>';
    expect(readSsoLogin(html)).toEqual({ kind: 'ticket', ticket: 'ST-123' });
  });

  it('reports a missing CSRF token on an MFA page', () => {
    const html = `<html><head><title>Enter MFA code for login</title></head><body>
<script>var mfaMethod = "email";</script></body></html>`;
    expect(readSsoLogin(html)).toEqual({ kind: 'missing-csrf' });
  });

  it('reads the CSRF token from the sign-in form', () => {
    const page = parseSsoPage('<form><input name="_csrf" value="abc-token" /></form>');
    expect(page.csrfToken).toBe('abc-token');
  });
});
