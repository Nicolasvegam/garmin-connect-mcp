import { describe, expect, it } from 'vitest';
import { isSetupCommand, runSetup } from './setup-cli';

describe('setup command', () => {
  it('recognizes the documented setup argument', () => {
    expect(isSetupCommand(['node', 'build/index.js', 'setup'])).toBe(true);
    expect(isSetupCommand(['node', 'build/index.js'])).toBe(false);
  });

  it('prompts for the MFA code when authentication asks for it', async () => {
    const questions: string[] = [];
    const logs: string[] = [];
    let exitCode: number | undefined;

    await runSetup({
      env: { GARMIN_EMAIL: 'runner@example.com', GARMIN_PASSWORD: 'secret' },
      ask: async (question) => {
        questions.push(question);
        return '654321';
      },
      close: () => {},
      log: (message) => logs.push(message),
      exit: (code) => {
        exitCode = code;
      },
      authenticate: async (_email, _password, promptMfa) => {
        const code = await promptMfa();
        expect(code).toBe('654321');
        return 'Ada';
      },
    });

    expect(questions).toEqual(['MFA code: ']);
    expect(logs.some((line) => line.includes('MFA code required'))).toBe(true);
    expect(logs.some((line) => line.includes('Logged in as: Ada'))).toBe(true);
    expect(exitCode).toBeUndefined();
  });

  it('asks for email and password when they are not in the environment', async () => {
    const questions: string[] = [];

    await runSetup({
      env: {},
      ask: async (question) => {
        questions.push(question);
        if (question.startsWith('Garmin email')) return 'runner@example.com';
        if (question.startsWith('Garmin password')) return 'secret';
        return '';
      },
      close: () => {},
      log: () => {},
      exit: () => {},
      authenticate: async (email, password) => {
        expect(email).toBe('runner@example.com');
        expect(password).toBe('secret');
        return 'Ada';
      },
    });

    expect(questions).toEqual(['Garmin email: ', 'Garmin password: ']);
  });

  it('exits when email or password is missing', async () => {
    let exitCode: number | undefined;

    await runSetup({
      env: {},
      ask: async () => '',
      close: () => {},
      log: () => {},
      exit: (code) => {
        exitCode = code;
      },
      authenticate: async () => 'unused',
    });

    expect(exitCode).toBe(1);
  });
});
