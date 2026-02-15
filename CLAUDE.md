# Garmin Connect MCP Server

MCP server para Garmin Connect en TypeScript. 61 tools para acceso a datos de fitness, salud y entrenamiento.

---

## 1. Estructura del Proyecto

```
src/
  index.ts              Entry point: MCP server + stdio transport
  client/
    garmin-auth.ts       Autenticacion SSO + OAuth1/OAuth2 (basado en python-garminconnect)
    garmin.client.ts     Cliente con metodos para cada endpoint
    index.ts             Barrel
  constants/
    garmin-endpoints.ts  URLs de la API de Garmin Connect
    index.ts             Barrel
  dtos/
    date-params.dto.ts   Params de fecha (tipo + schema Zod)
    activities.dto.ts    Params de actividades
    devices.dto.ts       Params de dispositivos
    index.ts             Barrel
  tools/
    activities.tools.ts  Tools de actividades (12)
    health.tools.ts      Tools de salud diaria (14)
    trends.tools.ts      Tools de tendencias (4)
    sleep.tools.ts       Tools de sueno (2)
    body.tools.ts        Tools de composicion corporal (5)
    performance.tools.ts Tools de performance y training (11)
    profile.tools.ts     Tools de perfil y dispositivos (13)
    index.ts             Barrel
```

---

## 2. DTOs: Tipo Explicito + Schema Zod

Cada DTO tiene un `type` explicito y un `schema` Zod paralelo. El tipo nunca se infiere del schema con `z.infer<>`.

```typescript
export type DateRangeParamDto = {
  startDate: string;
  endDate: string;
};

export const dateRangeParamSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
});
```

---

## 3. Tools MCP: Patron registerTool

Cada tool usa `server.registerTool` con config object e inputSchema usando `.shape` del Zod schema.

```typescript
server.registerTool(
  'get_activities',
  {
    description: 'Get recent activities from Garmin Connect',
    inputSchema: getActivitiesSchema.shape,
  },
  async ({ start, limit }) => {
    const data = await client.getActivities(start ?? 0, limit ?? 20);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    };
  },
);
```

---

## 4. Barrel Exports

Cada carpeta tiene un `index.ts` que re-exporta todo. Los imports usan la carpeta, sin extension.

```typescript
export { GarminClient } from './garmin.client';
```

```typescript
import { GarminClient } from './client';
import { dateParamSchema } from '../dtos';
```

---

## 5. Convenciones de Nombrado

| Patron | Convencion | Ejemplo |
|--------|-----------|---------|
| Clases | PascalCase | `GarminClient` |
| Variables/funciones | camelCase | `getActivities`, `todayString` |
| Archivos | kebab-case | `garmin.client.ts`, `date-params.dto.ts` |
| Constantes | UPPERCASE | `DAILY_HEART_RATE_ENDPOINT` |
| Booleanos | Prefijo `is/has` | `isAuthenticated` |
| Funciones | Empiezan con verbo | `getSteps`, `ensureAuthenticated` |
| DTOs tipo | `{Verbo}{Algo}Dto` | `GetActivitiesDto` |
| DTOs schema | `{verbo}{Algo}Schema` | `getActivitiesSchema` |
| Tools files | `{categoria}.tools.ts` | `health.tools.ts` |
| Register functions | `register{Cat}Tools` | `registerHealthTools` |

---

## 6. Stack Tecnico

| Componente | Eleccion |
|------------|----------|
| Runtime | Node.js 20+ |
| Lenguaje | TypeScript (strict) |
| MCP SDK | `@modelcontextprotocol/sdk` |
| HTTP Client | `axios` + `tough-cookie` |
| OAuth | `oauth-1.0a` (HMAC-SHA1) |
| Validacion | `zod` |
| Transport | stdio |
| Build | `tsup` (ESM, node20 target) |
| Module Resolution | Bundler (sin extensiones .js en imports) |

---

## 7. Autenticacion

Flujo basado en `python-garminconnect` (cyberjunky) via `garth`:

1. Fetch OAuth consumer credentials desde S3
2. SSO login (embed → signin → POST credentials → extract ticket)
3. Exchange ticket → OAuth1 token (HMAC-SHA1 signed)
4. Exchange OAuth1 → OAuth2 token (Bearer)
5. Auto-refresh OAuth2 en 401 usando OAuth1
6. Tokens persistidos en `~/.garmin-mcp/` (oauth1_token.json, oauth2_token.json)

---

## 8. Reglas

- Sin comentarios en el codigo
- Imports locales sin extension (`.js` ni `.ts`)
- Imports de librerias externas con su path completo (`@modelcontextprotocol/sdk/server/mcp.js`)
- `console.error()` para logging (nunca `console.log` en servidores stdio)
- Autenticacion via env vars `GARMIN_EMAIL` y `GARMIN_PASSWORD`
- Tokens cacheados en `~/.garmin-mcp/`
- Retry automatico con re-auth si un request falla con 401
