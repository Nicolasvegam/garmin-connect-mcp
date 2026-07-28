# Garmin WhatsApp Agent

Tu asistente personal de Garmin Connect por WhatsApp, potenciado por tu suscripcion de Claude (Pro/Max). Todo en una sola app: wizard de configuracion web, agente con las 97 herramientas de Garmin, y canal WhatsApp via [Kapso](https://kapso.ai).

```
WhatsApp ──▶ Kapso (webhook) ──▶ Next.js ──▶ Claude Agent SDK ──▶ Garmin Connect
                 ◀───────────── respuesta ◀──────────────────────┘
```

## Como funciona

- **Suscripcion de Claude**: el agente corre con el [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk) autenticado con un token de `claude setup-token` (valido 1 año, requiere plan Pro/Max/Team/Enterprise). Sin API keys de pago por uso.
- **Garmin Connect**: el codigo de autenticacion SSO + OAuth1/OAuth2 esta integrado en la app (basado en [garmin-connect-mcp](https://github.com/Nicolasvegam/garmin-connect-mcp)). Las credenciales se usan una sola vez; solo se persisten tokens OAuth en `DATA_DIR/garmin/`. Soporta MFA desde el wizard.
- **Herramientas**: las 97 tools de Garmin se exponen al agente como servidor MCP *in-process* (`createSdkMcpServer`), sin subprocesos ni transporte stdio.
- **WhatsApp**: Kapso entrega los mensajes entrantes por webhook y la app responde via el proxy Meta de Kapso (`@kapso/whatsapp-cloud-api`).

## Requisitos

- Node.js 20+
- Plan Claude Pro o Max
- Cuenta en [kapso.ai](https://kapso.ai) con un numero de WhatsApp conectado
- Cuenta de Garmin Connect
- Un lugar donde correr la app con proceso persistente y URL publica (Fly.io, Railway, VPS). No sirve serverless puro: las respuestas del agente pueden tardar mas que el timeout de una lambda.

## Setup

```bash
npm install
cp .env.example .env   # setea MASTER_KEY (openssl rand -hex 32)
npm run dev
```

Abre `http://localhost:3000` y sigue el wizard:

1. **Claude** — en tu computador: `npm i -g @anthropic-ai/claude-code && claude setup-token`. Pega el token (`sk-ant-oat…`) y pruebalo con el boton "Probar conexion".
2. **Garmin** — email y password de Garmin Connect. Si tu cuenta tiene MFA, el wizard te pedira el codigo. El password se descarta tras obtener los tokens.
3. **Kapso** — pega la API key del proyecto, elige tu numero, ingresa la URL publica de esta app y crea el webhook con un clic. Configura los numeros permitidos (recomendado: solo el tuyo).

Para probar en local necesitas exponer el puerto con un tunel (`cloudflared tunnel --url http://localhost:3000` o `ngrok http 3000`) y usar esa URL como "URL publica".

## Deploy

```bash
docker build -t garmin-whatsapp-agent .
docker run -p 3000:3000 -v garmin-data:/data -e MASTER_KEY=$(openssl rand -hex 32) garmin-whatsapp-agent
```

Monta `/data` como volumen persistente: ahi viven los tokens de Garmin, la configuracion cifrada y las sesiones de conversacion.

## Seguridad

- Secretos (token de Claude, API key de Kapso, webhook secret) cifrados con AES-256-GCM usando `MASTER_KEY`.
- Firma de webhooks verificada (HMAC-SHA256 sobre el body crudo, header `X-Webhook-Signature`). Si el secret no se detecta al crear el webhook, copialo del dashboard de Kapso y guardalo en el paso 3.
- Allowlist de numeros: cualquier mensaje de un numero no permitido se ignora. Sin allowlist, cualquiera que escriba a tu numero consume tu suscripcion.
- El agente corre sin herramientas built-in (`tools: []`): solo puede usar las tools de Garmin.

## Notas

- Los endpoints del API de plataforma de Kapso (listar numeros, crear webhook) pueden variar; si el boton falla, crea el webhook manualmente en el dashboard apuntando a `https://TU-URL/api/webhooks/kapso` y pega el secret en el wizard.
- Sesiones: cada numero de WhatsApp mantiene su propia conversacion con memoria (resume del Agent SDK). Si una sesion se corrompe, se reinicia sola.
- Uso programatico de la suscripcion: consulta los limites vigentes de tu plan en [support.claude.com](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan).
