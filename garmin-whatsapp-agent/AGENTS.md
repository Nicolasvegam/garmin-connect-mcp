# Garmin WhatsApp Agent

Agente de WhatsApp para datos de Garmin Connect, potenciado por la suscripcion de Claude del usuario (Claude Agent SDK) y Kapso como canal WhatsApp. Una sola app: wizard de setup web + webhook + runtime del agente.

## Arquitectura

```
WhatsApp → Kapso (webhook) → Hono server → Claude Agent SDK → tools de Garmin (MCP in-process)
                ◀──────────── respuesta via proxy Meta de Kapso ◀─┘
```

## Estructura

```
src/
  server.ts            Entry point: Hono + static wizard + rutas
  routes/
    setup.ts           API del wizard (/api/setup/*): claude, garmin, mfa, kapso, status
    webhook.ts         /api/webhooks/kapso: firma HMAC, dedup, allowlist, encola turnos
  agent/
    runtime.ts         runAgentTurn(): query() del Agent SDK con sesion por conversacion
    garmin-server.ts   Shim que convierte los tools de Garmin en createSdkMcpServer()
    queue.ts           Cola serial por conversacion + dedup de message ids
  garmin/              Codigo vendoreado de garmin-connect-mcp (NO agregar deps de MCP)
    client/            Auth SSO+OAuth1/OAuth2 y cliente de endpoints
    constants/         URLs del API de Garmin
    dtos/              Tipos explicitos + schemas Zod paralelos
    tools/             97 tools; usan ToolRegistrar (registrar.ts), no el SDK de MCP
  lib/
    env.ts             DATA_DIR y endpoints de Kapso
    crypto.ts          AES-256-GCM con MASTER_KEY (o data/master.key autogenerada)
    store.ts           config.json + sessions.json cifrados en DATA_DIR
    garmin-setup.ts    Login de Garmin con MFA round-trip (estado en globalThis)
    kapso.ts           Envio de mensajes + API de plataforma de Kapso
public/                Wizard estatico (HTML + JS vanilla, sin build de frontend)
```

## Comandos

| Comando | Que hace |
|---------|----------|
| `npm run dev` | tsx watch, server en :3000 |
| `npm run build` | tsup → dist/server.js |
| `npm start` | node dist/server.js |
| `npm run typecheck` | tsc --noEmit |

## Reglas

- Sin comentarios en el codigo
- Imports locales sin extension; librerias externas con path completo
- `console.error()` para logging
- Secretos siempre via `lib/crypto.ts` antes de persistir; nunca loggear tokens
- El codigo en `src/garmin/` viene de [garmin-connect-mcp](https://github.com/Nicolasvegam/garmin-connect-mcp): mantener el diff minimo para poder portar fixes upstream. Cambios propios van en `agent/`, `lib/` o `routes/`
- Estado compartido entre requests via `globalThis` (patron en `garmin-setup.ts` y `queue.ts`)
- El agente corre con `tools: []` (sin built-ins) y solo `mcp__garmin__*` en allowedTools; no ampliar sin revisar seguridad
- `CLAUDE_CODE_OAUTH_TOKEN` se inyecta por llamada en `options.env`, borrando `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN` para que facture a la suscripcion

## Gotchas

- El server debe correr como proceso persistente (los turnos del agente siguen tras responder el webhook); no desplegar en serverless
- `DATA_DIR` (default `./data`) guarda tokens de Garmin, config cifrada y sesiones: montarlo como volumen en Docker
- Los endpoints del API de plataforma de Kapso (`lib/kapso.ts`) estan escritos segun docs publicas; si cambian, el wizard tiene fallback manual (pegar webhook secret)
- El password de Garmin nunca se persiste; si los tokens OAuth expiran (~1 año) el usuario repite el paso 2 del wizard
