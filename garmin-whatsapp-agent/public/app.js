const $ = (id) => document.getElementById(id);

let status = null;
let garminPoll = null;

async function post(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

function showMessage(id, kind, text) {
  const el = $(id);
  el.hidden = false;
  el.className = `message ${kind}`;
  el.textContent = text;
}

function markStep(stepId, done, statusText) {
  const step = $(stepId);
  const num = step.querySelector('.step-number');
  num.classList.toggle('done', done);
  num.textContent = done ? '✓' : num.dataset.num;
  step.querySelector('.step-status').textContent = statusText;
}

async function refresh() {
  const response = await fetch('/api/setup/status');
  if (!response.ok) return;
  status = await response.json();

  markStep('step-claude', status.claude, status.claude ? 'Configurado' : 'Pendiente');
  $('claude-test').hidden = !status.claude;

  const g = status.garmin;
  markStep('step-garmin', g.connected, g.connected ? `Conectado (${g.email})` : 'Pendiente');
  $('garmin-mfa').hidden = g.setup.status !== 'pending_mfa';
  if (g.setup.status === 'connected' && garminPoll) {
    stopGarminPoll();
    showMessage('garmin-msg', 'ok', 'Garmin conectado. Password descartado: solo guardamos tokens.');
  }
  if (g.setup.status === 'error' && garminPoll) {
    stopGarminPoll();
    showMessage('garmin-msg', 'error', g.setup.error ?? 'Fallo el login');
  }

  const k = status.kapso;
  const kapsoDone = k.configured && Boolean(k.phoneNumberId);
  markStep('step-kapso', kapsoDone, kapsoDone ? 'Configurado' : 'Pendiente');
  if (k.phoneNumberId) $('kapso-phone-id').value ||= k.phoneNumberId;
  if (k.publicUrl) $('kapso-url').value ||= k.publicUrl;
  if (status.allowedNumbers.length) $('kapso-allowed').value ||= status.allowedNumbers.join(', ');

  const allReady = status.claude && g.connected && kapsoDone;
  $('step-ready').hidden = !allReady;
  if (allReady) $('ready-number').textContent = k.displayPhoneNumber ?? k.phoneNumberId;
}

function stopGarminPoll() {
  clearInterval(garminPoll);
  garminPoll = null;
}

$('claude-save').addEventListener('click', async () => {
  const { ok, data } = await post('/api/setup/claude', { token: $('claude-token').value.trim() });
  showMessage('claude-msg', ok ? 'ok' : 'error', ok ? 'Token guardado.' : data.error);
  if (ok) {
    $('claude-token').value = '';
    await refresh();
  }
});

$('claude-test').addEventListener('click', async () => {
  showMessage('claude-msg', 'ok', 'Probando token (puede tardar ~30s)…');
  const { ok, data } = await post('/api/setup/claude/test');
  showMessage('claude-msg', ok ? 'ok' : 'error', ok ? `Funciona. Claude respondio: ${data.result}` : data.error);
});

$('garmin-connect').addEventListener('click', async () => {
  const { ok, data } = await post('/api/setup/garmin', {
    email: $('garmin-email').value.trim(),
    password: $('garmin-password').value,
  });
  if (!ok) {
    showMessage('garmin-msg', 'error', data.error);
    return;
  }
  showMessage('garmin-msg', 'ok', 'Autenticando con Garmin…');
  garminPoll ??= setInterval(refresh, 2500);
});

$('garmin-mfa-send').addEventListener('click', async () => {
  const { ok, data } = await post('/api/setup/garmin/mfa', { code: $('garmin-mfa-code').value.trim() });
  if (!ok) {
    showMessage('garmin-msg', 'error', data.error);
    return;
  }
  $('garmin-mfa-code').value = '';
  showMessage('garmin-msg', 'ok', 'Verificando codigo…');
});

$('kapso-list').addEventListener('click', async () => {
  const { ok, data } = await post('/api/setup/kapso', {
    action: 'list_numbers',
    apiKey: $('kapso-key').value.trim(),
  });
  if (!ok) {
    showMessage('kapso-msg', 'error', data.error);
    return;
  }
  const list = Array.isArray(data.numbers) ? data.numbers : (data.numbers?.data ?? []);
  const container = $('kapso-numbers');
  container.innerHTML = '';
  for (const n of list) {
    const id = String(n.id ?? n.phone_number_id ?? '');
    const display = String(n.display_phone_number ?? n.phone_number ?? id);
    const button = document.createElement('button');
    button.className = 'secondary';
    button.textContent = display;
    button.addEventListener('click', () => {
      $('kapso-phone-id').value = id;
    });
    container.appendChild(button);
  }
  showMessage(
    'kapso-msg',
    'ok',
    list.length
      ? `Encontre ${list.length} numero(s). Haz clic en uno para seleccionarlo.`
      : 'No encontre numeros: revisa la API key o crea un numero en Kapso.',
  );
});

async function saveKapso(withWebhook) {
  const payload = {
    action: withWebhook ? 'create_webhook' : 'save',
    apiKey: $('kapso-key').value.trim(),
    phoneNumberId: $('kapso-phone-id').value.trim() || undefined,
    publicUrl: $('kapso-url').value.trim() || undefined,
    webhookSecret: $('kapso-secret').value.trim() || undefined,
    allowedNumbers: $('kapso-allowed').value.split(',').map((n) => n.trim()).filter(Boolean),
  };
  const { ok, data } = await post('/api/setup/kapso', payload);
  if (!ok) {
    showMessage('kapso-msg', 'error', data.error);
    return;
  }
  showMessage(
    'kapso-msg',
    'ok',
    withWebhook
      ? `Webhook creado en ${data.webhookUrl}.${data.secretDetected ? '' : ' No detecte el secret automaticamente: copialo del dashboard de Kapso y guardalo aqui.'}`
      : 'Configuracion guardada.',
  );
  await refresh();
}

$('kapso-webhook').addEventListener('click', () => saveKapso(true));
$('kapso-save').addEventListener('click', () => saveKapso(false));

void refresh();
