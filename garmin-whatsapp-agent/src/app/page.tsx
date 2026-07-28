'use client';

import { useCallback, useEffect, useState } from 'react';

type Status = {
  claude: boolean;
  garmin: {
    connected: boolean;
    email: string | null;
    setup: { status: string; error?: string };
  };
  kapso: {
    configured: boolean;
    phoneNumberId: string | null;
    displayPhoneNumber: string | null;
    publicUrl: string | null;
    hasWebhookSecret: boolean;
  };
  allowedNumbers: string[];
};

type Feedback = { kind: 'ok' | 'error'; text: string } | null;

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; data: any }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export default function SetupWizard() {
  const [status, setStatus] = useState<Status | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/setup/status');
    if (response.ok) setStatus(await response.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const allReady = Boolean(
    status?.claude && status.garmin.connected && status.kapso.configured && status.kapso.phoneNumberId,
  );

  return (
    <main className="container">
      <h1>Garmin WhatsApp Agent</h1>
      <p className="subtitle">
        Conecta tu suscripcion de Claude, tu cuenta de Garmin y tu numero de WhatsApp (Kapso). Tres
        pasos y listo.
      </p>

      {status === null ? (
        <p className="hint">Cargando…</p>
      ) : (
        <>
          <ClaudeStep done={status.claude} onChanged={refresh} />
          <GarminStep
            done={status.garmin.connected}
            email={status.garmin.email}
            setupStatus={status.garmin.setup}
            onChanged={refresh}
          />
          <KapsoStep status={status} onChanged={refresh} />
          {allReady && (
            <div className="step ready">
              <h2>✅ Todo listo</h2>
              <p className="hint">Escribele por WhatsApp a tu numero conectado:</p>
              <p className="number">{status.kapso.displayPhoneNumber ?? status.kapso.phoneNumberId}</p>
              <p className="hint">
                Prueba con: “¿como dormi anoche?” o “resumen de mi semana de entrenamiento”.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function ClaudeStep({ done, onChanged }: { done: boolean; onChanged: () => Promise<void> }) {
  const [token, setToken] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setFeedback(null);
    const { ok, data } = await postJson('/api/setup/claude', { token });
    setFeedback(ok ? { kind: 'ok', text: 'Token guardado.' } : { kind: 'error', text: data.error });
    setBusy(false);
    if (ok) {
      setToken('');
      await onChanged();
    }
  };

  const test = async () => {
    setBusy(true);
    setFeedback({ kind: 'ok', text: 'Probando token (puede tardar ~30s)…' });
    const { ok, data } = await postJson('/api/setup/claude/test', {});
    setFeedback(
      ok
        ? { kind: 'ok', text: `Funciona. Claude respondio: ${data.result}` }
        : { kind: 'error', text: data.error },
    );
    setBusy(false);
  };

  return (
    <section className="step">
      <div className="step-header">
        <span className={`step-number${done ? ' done' : ''}`}>{done ? '✓' : '1'}</span>
        <span className="step-title">Suscripcion de Claude</span>
        <span className="step-status">{done ? 'Configurado' : 'Pendiente'}</span>
      </div>
      <div className="step-body">
        <p className="hint">
          En tu computador (requiere plan Pro o Max), instala Claude Code y genera un token de larga
          duracion:
        </p>
        <pre className="command">npm install -g @anthropic-ai/claude-code{'\n'}claude setup-token</pre>
        <p className="hint">Pega aqui el token generado (empieza con <code>sk-ant-oat</code>):</p>
        <input
          type="password"
          placeholder="sk-ant-oat01-…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="row">
          <button onClick={save} disabled={busy || token.length < 10}>
            Guardar token
          </button>
          {done && (
            <button className="secondary" onClick={test} disabled={busy}>
              Probar conexion
            </button>
          )}
        </div>
        {feedback && <p className={`message ${feedback.kind}`}>{feedback.text}</p>}
      </div>
    </section>
  );
}

function GarminStep({
  done,
  email,
  setupStatus,
  onChanged,
}: {
  done: boolean;
  email: string | null;
  setupStatus: { status: string; error?: string };
  onChanged: () => Promise<void>;
}) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [mfaCode, setMfaCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      await onChanged();
    }, 2500);
    return () => clearInterval(interval);
  }, [polling, onChanged]);

  useEffect(() => {
    if (setupStatus.status === 'connected') {
      setPolling(false);
      setFeedback({ kind: 'ok', text: 'Garmin conectado. Password descartado: solo guardamos tokens.' });
    }
    if (setupStatus.status === 'error') {
      setPolling(false);
      setFeedback({ kind: 'error', text: setupStatus.error ?? 'Fallo el login' });
    }
  }, [setupStatus.status, setupStatus.error]);

  const start = async () => {
    setBusy(true);
    setFeedback(null);
    const { ok, data } = await postJson('/api/setup/garmin', form);
    setBusy(false);
    if (!ok) {
      setFeedback({ kind: 'error', text: data.error });
      return;
    }
    setPolling(true);
    setFeedback({ kind: 'ok', text: 'Autenticando con Garmin…' });
  };

  const sendMfa = async () => {
    setBusy(true);
    const { ok, data } = await postJson('/api/setup/garmin/mfa', { code: mfaCode });
    setBusy(false);
    if (!ok) {
      setFeedback({ kind: 'error', text: data.error });
      return;
    }
    setMfaCode('');
    setFeedback({ kind: 'ok', text: 'Verificando codigo…' });
  };

  return (
    <section className="step">
      <div className="step-header">
        <span className={`step-number${done ? ' done' : ''}`}>{done ? '✓' : '2'}</span>
        <span className="step-title">Cuenta de Garmin</span>
        <span className="step-status">{done ? `Conectado (${email})` : 'Pendiente'}</span>
      </div>
      <div className="step-body">
        <p className="hint">
          Tus credenciales se usan una sola vez para obtener tokens OAuth de Garmin (duran ~1 año).
          El password no se almacena.
        </p>
        <input
          type="email"
          placeholder="Email de Garmin Connect"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={start} disabled={busy || !form.email || !form.password}>
          {done ? 'Reconectar' : 'Conectar Garmin'}
        </button>
        {setupStatus.status === 'pending_mfa' && (
          <>
            <p className="hint">Garmin pide un codigo de verificacion (revisa tu email):</p>
            <input
              placeholder="Codigo MFA"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
            />
            <button onClick={sendMfa} disabled={busy || mfaCode.length < 4}>
              Enviar codigo
            </button>
          </>
        )}
        {feedback && <p className={`message ${feedback.kind}`}>{feedback.text}</p>}
      </div>
    </section>
  );
}

function KapsoStep({ status, onChanged }: { status: Status; onChanged: () => Promise<void> }) {
  const done = status.kapso.configured && Boolean(status.kapso.phoneNumberId);
  const [form, setForm] = useState({
    apiKey: '',
    phoneNumberId: status.kapso.phoneNumberId ?? '',
    displayPhoneNumber: status.kapso.displayPhoneNumber ?? '',
    publicUrl: status.kapso.publicUrl ?? '',
    webhookSecret: '',
    allowedNumbers: status.allowedNumbers.join(', '),
  });
  const [numbers, setNumbers] = useState<Array<Record<string, any>>>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const listNumbers = async () => {
    setBusy(true);
    setFeedback(null);
    const { ok, data } = await postJson('/api/setup/kapso', {
      action: 'list_numbers',
      apiKey: form.apiKey,
    });
    setBusy(false);
    if (!ok) {
      setFeedback({ kind: 'error', text: data.error });
      return;
    }
    const list = Array.isArray(data.numbers) ? data.numbers : (data.numbers?.data ?? []);
    setNumbers(Array.isArray(list) ? list : []);
    setFeedback({
      kind: 'ok',
      text: list.length
        ? `Encontre ${list.length} numero(s). Haz clic en uno para seleccionarlo.`
        : 'No encontre numeros: revisa la API key o crea un numero en Kapso.',
    });
  };

  const save = async (withWebhook: boolean) => {
    setBusy(true);
    setFeedback(null);
    const payload = {
      action: withWebhook ? 'create_webhook' : 'save',
      apiKey: form.apiKey,
      phoneNumberId: form.phoneNumberId || undefined,
      displayPhoneNumber: form.displayPhoneNumber || undefined,
      publicUrl: form.publicUrl || undefined,
      webhookSecret: form.webhookSecret || undefined,
      allowedNumbers: form.allowedNumbers
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
    };
    const { ok, data } = await postJson('/api/setup/kapso', payload);
    setBusy(false);
    if (!ok) {
      setFeedback({ kind: 'error', text: data.error });
      return;
    }
    setFeedback({
      kind: 'ok',
      text: withWebhook
        ? `Webhook creado en ${data.webhookUrl}.${data.secretDetected ? '' : ' No detecte el secret automaticamente: copialo del dashboard de Kapso y guardalo aqui.'}`
        : 'Configuracion guardada.',
    });
    await onChanged();
  };

  return (
    <section className="step">
      <div className="step-header">
        <span className={`step-number${done ? ' done' : ''}`}>{done ? '✓' : '3'}</span>
        <span className="step-title">WhatsApp via Kapso</span>
        <span className="step-status">{done ? 'Configurado' : 'Pendiente'}</span>
      </div>
      <div className="step-body">
        <p className="hint">
          Crea una cuenta en <code>kapso.ai</code>, conecta un numero de WhatsApp y copia la API key
          del proyecto.
        </p>
        <input
          type="password"
          placeholder="Kapso API key"
          value={form.apiKey}
          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
        />
        <div className="row">
          <button className="secondary" onClick={listNumbers} disabled={busy || !form.apiKey}>
            Buscar mis numeros
          </button>
        </div>
        {numbers.length > 0 && (
          <div className="row">
            {numbers.map((n, i) => {
              const id = String(n.id ?? n.phone_number_id ?? '');
              const display = String(n.display_phone_number ?? n.phone_number ?? id);
              return (
                <button
                  key={id || i}
                  className="secondary"
                  onClick={() => setForm({ ...form, phoneNumberId: id, displayPhoneNumber: display })}
                >
                  {display}
                </button>
              );
            })}
          </div>
        )}
        <input
          placeholder="Phone Number ID"
          value={form.phoneNumberId}
          onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
        />
        <input
          placeholder="URL publica de esta app (ej: https://miapp.fly.dev)"
          value={form.publicUrl}
          onChange={(e) => setForm({ ...form, publicUrl: e.target.value })}
        />
        <input
          type="password"
          placeholder="Webhook secret (opcional si usas el boton de webhook)"
          value={form.webhookSecret}
          onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
        />
        <input
          placeholder="Numeros permitidos, separados por coma (ej: +56912345678)"
          value={form.allowedNumbers}
          onChange={(e) => setForm({ ...form, allowedNumbers: e.target.value })}
        />
        <p className="hint">
          Recomendado: limita los numeros permitidos para que solo tu puedas usar el bot (cada
          mensaje consume tu suscripcion de Claude).
        </p>
        <div className="row">
          <button onClick={() => save(true)} disabled={busy || !form.apiKey || !form.phoneNumberId || !form.publicUrl}>
            Guardar y crear webhook
          </button>
          <button className="secondary" onClick={() => save(false)} disabled={busy || !form.apiKey}>
            Solo guardar
          </button>
        </div>
        {feedback && <p className={`message ${feedback.kind}`}>{feedback.text}</p>}
      </div>
    </section>
  );
}
