import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { chatRoutes } from './routes/chat';
import { setupRoutes } from './routes/setup';
import { webhookRoutes } from './routes/webhook';

const app = new Hono();

app.route('/api/setup', setupRoutes);
app.route('/api/webhooks', webhookRoutes);
app.route('/api/chat', chatRoutes);
app.use('/*', serveStatic({ root: './public' }));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
console.error(`garmin-whatsapp-agent listening on http://0.0.0.0:${port}`);
