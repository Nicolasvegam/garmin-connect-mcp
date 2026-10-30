import readline from 'node:readline';
import { GarminAuth } from './client';

type SetupIo = {
  ask: (question: string) => Promise<string>;
  close: () => void;
  log: (message: string) => void;
  exit: (code: number) => void;
  env: NodeJS.ProcessEnv;
  authenticate: (
    email: string,
    password: string,
    promptMfa: () => Promise<string>,
  ) => Promise<string>;
};

export function isSetupCommand(argv: readonly string[]): boolean {
  return argv[2] === 'setup';
}

async function authenticateWithGarmin(
  email: string,
  password: string,
  promptMfa: () => Promise<string>,
): Promise<string> {
  const auth = new GarminAuth(email, password, promptMfa);
  await auth.request('/userprofile-service/socialProfile');
  return auth.displayName;
}

function createReadlineIo(): Pick<SetupIo, 'ask' | 'close'> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return {
    ask: (question) =>
      new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
      }),
    close: () => rl.close(),
  };
}

export async function runSetup(overrides: Partial<SetupIo> = {}): Promise<void> {
  const needsReadline = !overrides.ask || !overrides.close;
  const readlineIo = needsReadline ? createReadlineIo() : null;
  const ask = overrides.ask ?? readlineIo!.ask;
  const close = overrides.close ?? readlineIo!.close;
  const log = overrides.log ?? ((message: string) => console.error(message));
  const exit = overrides.exit ?? ((code: number) => process.exit(code));
  const env = overrides.env ?? process.env;
  const authenticate = overrides.authenticate ?? authenticateWithGarmin;

  log('Garmin Connect MCP — Interactive Setup');
  log('This will authenticate with Garmin Connect and save tokens to ~/.garmin-mcp/\n');

  try {
    const email = env.GARMIN_EMAIL ?? (await ask('Garmin email: '));
    const password = env.GARMIN_PASSWORD ?? (await ask('Garmin password: '));

    if (!email || !password) {
      log('Error: email and password are required');
      exit(1);
      return;
    }

    const displayName = await authenticate(email, password, async () => {
      log('\nMFA code required — check your email or authenticator app');
      return ask('MFA code: ');
    });

    log('\nAuthentication successful!');
    log(`Logged in as: ${displayName}`);
    log('Tokens saved to ~/.garmin-mcp/');
    log('\nYou can now restart Claude Desktop — the MCP server will use the saved tokens.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`\nAuthentication failed: ${message}`);
    exit(1);
  } finally {
    close();
  }
}
