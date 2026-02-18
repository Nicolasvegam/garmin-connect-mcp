import readline from 'node:readline';
import { GarminAuth } from './client';

const rl = readline.createInterface({ input: process.stdin, output: process.stderr });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main(): Promise<void> {
  console.error('Garmin Connect MCP — Interactive Setup');
  console.error('This will authenticate with Garmin Connect and save tokens to ~/.garmin-mcp/\n');

  const email = process.env.GARMIN_EMAIL ?? await ask('Garmin email: ');
  const password = process.env.GARMIN_PASSWORD ?? await ask('Garmin password: ');

  if (!email || !password) {
    console.error('Error: email and password are required');
    process.exit(1);
  }

  const auth = new GarminAuth(email, password, async () => {
    console.error('\nMFA code required — check your email or authenticator app');
    return ask('MFA code: ');
  });

  try {
    await auth.request('/userprofile-service/socialProfile');
    console.error('\nAuthentication successful!');
    console.error(`Logged in as: ${auth.displayName}`);
    console.error('Tokens saved to ~/.garmin-mcp/');
    console.error('\nYou can now restart Claude Desktop — the MCP server will use the saved tokens.');
  } catch (error) {
    console.error('\nAuthentication failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
