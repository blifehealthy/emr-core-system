import assert from 'node:assert/strict';
import { createReadStream, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';

const ROOT_DIR = process.cwd();
const FRONTEND_DIR = join(ROOT_DIR, 'frontend');
const HOST = '127.0.0.1';
const PORT = Number(process.env.BROWSER_SMOKE_PORT ?? '5185');
const DEBUG_PORT = Number(process.env.BROWSER_SMOKE_DEBUG_PORT ?? '9225');
const CHROME_BIN = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';

const CLINIC_ID = '10000000-0000-0000-0000-000000000101';
const PATIENT_ID = 'browser-patient-001';
const PRACTITIONER_ID = 'browser-practitioner-001';
const VISIT_ID = 'browser-visit-001';
const ENCOUNTER_ID = 'browser-encounter-001';

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const visit = {
  id: VISIT_ID,
  clinic_id: CLINIC_ID,
  patient_id: PATIENT_ID,
  appointment_id: 'browser-appointment-001',
  practitioner_id: null as string | null,
  practitioner_first_name: null as string | null,
  practitioner_last_name: null as string | null,
  medical_record_number: 'MRN-BROWSER-001',
  patient_first_name: 'Mali',
  patient_last_name: 'Browser',
  visit_number: 'VIS-BROWSER-001',
  queue_label: 'Q-BROWSER',
  status: 'waiting',
  room_name: null as string | null,
  encounter_id: null as string | null,
  notes: 'Headache and follow-up',
  checked_in_at: new Date('2026-05-25T03:00:00.000Z').toISOString(),
};

async function main() {
  let chrome: ChildProcess | null = null;
  const userDataDir = mkdtempSync(join(tmpdir(), 'emr-browser-smoke-'));
  const server = createServer(handleRequest);

  try {
    server.listen(PORT, HOST);
    await once(server, 'listening');

    chrome = spawn(CHROME_BIN, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${userDataDir}`,
      `http://${HOST}:${PORT}/`,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    const endpoint = await waitForPageWebSocketUrl();
    const cdp = await DevToolsClient.connect(endpoint);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: `http://${HOST}:${PORT}/` });
    await cdp.waitForEvent('Page.loadEventFired');

    await evaluate(cdp, `
      document.querySelector('[data-view="queue"]').click();
      document.querySelector('#apiToken').value = 'browser-smoke-token';
      document.querySelector('#userId').value = 'browser-user-001';
      document.querySelector('#actorPractitionerId').value = '${PRACTITIONER_ID}';
      document.querySelector('#queueClinicId').value = '${CLINIC_ID}';
      document.querySelector('#queueLimit').value = '20';
      document.querySelector('#queue-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.body.textContent.includes('Q-BROWSER') && document.querySelectorAll('.bar-chart').length >= 4`);

    await evaluate(cdp, `return clickButtonByText('รับเคส');`);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('รับเคสแล้ว')`);
    assert.equal(visit.practitioner_id, PRACTITIONER_ID);

    await evaluate(cdp, `return clickButtonByText('เริ่มตรวจ');`);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เริ่มตรวจและผูก encounter แล้ว')`);
    await waitFor(cdp, `document.body.textContent.includes('เปิดเวชระเบียน') || document.body.textContent.includes('Prescriptions 1')`);
    assert.equal(visit.encounter_id, ENCOUNTER_ID);
    assert.equal(visit.status, 'with_doctor');

    await evaluate(cdp, `
      window.__lastPrintHtml = '';
      window.open = () => ({
        document: {
          write(html) { window.__lastPrintHtml = html; },
          close() {},
        },
        focus() {},
        print() { window.__printCalled = true; },
      });
      clickButtonByText('Prescriptions');
      clickButtonByText('พิมพ์ใบสั่งยา');
      return true;
    `);
    await waitFor(cdp, `window.__printCalled === true && window.__lastPrintHtml.includes('ใบสั่งยา / Prescription')`);
    const printHtml = await evaluate<string>(cdp, `return window.__lastPrintHtml;`);
    assert.match(printHtml, /Browser Clinic/);
    assert.match(printHtml, /Paracetamol/);
    assert.match(printHtml, /Mali Browser/);

    await cdp.close();
    console.log('Browser workflow smoke passed');
  } finally {
    server.close();
    if (chrome && !chrome.killed) {
      chrome.kill('SIGTERM');
      await once(chrome, 'exit').catch(() => undefined);
    }
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 20, retryDelay: 150 });
  }
}

function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${HOST}:${PORT}`);

  if (url.pathname.startsWith('/api/')) {
    void handleApiRequest(req, res, url);
    return;
  }

  serveStaticFile(res, url.pathname);
}

async function handleApiRequest(req: IncomingMessage, res: ServerResponse, url: URL) {
  const body = await readJsonBody(req);

  if (req.method === 'GET' && url.pathname === '/api/queue') {
    writeJson(res, 200, { data: filterQueue(url) });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/reports/daily-operations') {
    writeJson(res, 200, { data: dailyReport() });
    return;
  }

  if (req.method === 'PATCH' && url.pathname === `/api/visits/${VISIT_ID}`) {
    if (body.practitionerId !== undefined) {
      visit.practitioner_id = body.practitionerId;
      visit.practitioner_first_name = 'Doctor';
      visit.practitioner_last_name = 'Browser';
    }
    if (body.encounterId !== undefined) visit.encounter_id = body.encounterId;
    if (body.status !== undefined) visit.status = body.status;
    if (body.roomName !== undefined) visit.room_name = body.roomName;
    writeJson(res, 200, { data: visit });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/encounters') {
    writeJson(res, 201, {
      data: {
        encounter: {
          id: ENCOUNTER_ID,
          patient_id: PATIENT_ID,
          encounter_number: body.encounterNumber,
          status: 'in_progress',
        },
      },
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/patients/detail') {
    writeJson(res, 200, { data: patientDetail() });
    return;
  }

  if (req.method === 'GET' && url.pathname === `/api/patients/${PATIENT_ID}/allergies`) return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === `/api/patients/${PATIENT_ID}/conditions`) return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === `/api/patients/${PATIENT_ID}/medications`) return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === `/api/patients/${PATIENT_ID}/flags`) return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === `/api/patients/${PATIENT_ID}/timeline`) return writeJson(res, 200, { data: [] });

  if (req.method === 'GET' && url.pathname === '/api/appointments') return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === '/api/practitioners') {
    return writeJson(res, 200, {
      data: [{ id: PRACTITIONER_ID, first_name: 'Doctor', last_name: 'Browser', role: 'doctor', is_active: true }],
      meta: { limit: 200, offset: 0, hasMore: false, nextOffset: null },
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/clinical-note-templates') return writeJson(res, 200, { data: [] });
  if (req.method === 'GET' && url.pathname === `/api/clinics/${CLINIC_ID}/settings`) {
    return writeJson(res, 200, {
      data: {
        clinic_id: CLINIC_ID,
        display_name: 'Browser Clinic',
        address: '123 Smoke Test Road',
        phone_number: '+66000000000',
        prescription_footer: 'Browser smoke signature',
      },
    });
  }

  writeJson(res, 404, { error: `Unhandled mock route: ${req.method} ${url.pathname}` });
}

function filterQueue(url: URL) {
  const status = url.searchParams.get('status');
  const practitionerId = url.searchParams.get('practitionerId');
  const roomName = url.searchParams.get('roomName');
  return [visit].filter((item) => {
    if (status && item.status !== status) return false;
    if (practitionerId && item.practitioner_id !== practitionerId) return false;
    if (roomName && item.room_name !== roomName) return false;
    return true;
  });
}

function dailyReport() {
  return {
    start_date: '2026-05-25',
    end_date: '2026-05-25',
    visits_total: 3,
    waiting: visit.status === 'waiting' ? 1 : 0,
    in_room: 1,
    with_doctor: visit.status === 'with_doctor' ? 1 : 0,
    completed: 1,
    discharged: 0,
    cancelled: 0,
    diagnoses_total: 2,
    prescriptions_total: 1,
    by_practitioner: [{ practitioner_id: PRACTITIONER_ID, visits: 2 }],
    by_room: [{ room_name: 'Room A', visits: 2 }],
    top_diagnoses: [{ diagnosis_name: 'Headache', count: 2 }],
    by_prescriber: [{ prescribed_by_practitioner_id: PRACTITIONER_ID, prescriptions: 1 }],
  };
}

function patientDetail() {
  return {
    id: PATIENT_ID,
    clinic_id: CLINIC_ID,
    medical_record_number: 'MRN-BROWSER-001',
    first_name: 'Mali',
    last_name: 'Browser',
    sex_at_birth: 'female',
    phone_number: '+66111111111',
    email: 'mali@example.test',
    flags: [],
    encounters: [{
      id: ENCOUNTER_ID,
      patient_id: PATIENT_ID,
      encounter_number: 'ENC-BROWSER-001',
      status: 'in_progress',
      encounter_class: 'outpatient',
      started_at: new Date('2026-05-25T03:05:00.000Z').toISOString(),
      prescriptions: [{
        id: 'browser-prescription-001',
        encounter_id: ENCOUNTER_ID,
        prescribed_by_practitioner_id: PRACTITIONER_ID,
        medication_name: 'Paracetamol',
        dosage: '500 mg',
        route: 'oral',
        frequency: 'three times daily',
        duration_text: '3 days',
        instructions: 'Take after meals',
        status: 'active',
      }],
      diagnoses: [],
      vital_signs: [],
      clinical_notes: [],
    }],
  };
}

function serveStaticFile(res: ServerResponse, requestPath: string) {
  const pathname = requestPath === '/' ? '/index.html' : requestPath;
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(FRONTEND_DIR, normalized);

  if (!filePath.startsWith(FRONTEND_DIR) || !existsSync(filePath)) {
    writeJson(res, 404, { error: 'Not found' });
    return;
  }

  res.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function writeJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function waitForPageWebSocketUrl() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://${HOST}:${DEBUG_PORT}/json/list`);
      const pages = await response.json() as Array<{ type: string; webSocketDebuggerUrl: string }>;
      const page = pages.find((item) => item.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Chrome DevTools endpoint');
}

async function evaluate<T = unknown>(cdp: DevToolsClient, expression: string) {
  const result = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        window.clickButtonByText = window.clickButtonByText || ((text) => {
          const button = Array.from(document.querySelectorAll('button'))
            .find((item) => item.textContent.trim().includes(text));
          if (!button) throw new Error('Button not found: ' + text);
          button.click();
          return true;
        });
        return (async () => {
          ${expression}
        })();
      })()
    `,
    awaitPromise: true,
    returnByValue: true,
  }) as { result?: { value?: T }; exceptionDetails?: unknown };

  if (result.exceptionDetails) {
    throw new Error(`Browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
  }

  return result.result?.value as T;
}

async function waitFor(cdp: DevToolsClient, expression: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ok = await evaluate<boolean>(cdp, `return Boolean(${expression});`).catch(() => false);
    if (ok) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for browser condition: ${expression}`);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class DevToolsClient {
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private eventWaiters = new Map<string, Array<(params: unknown) => void>>();

  private constructor(private socket: WebSocket) {
    socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
  }

  static async connect(url: string) {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener('error', () => reject(new Error('Failed to open DevTools WebSocket')), { once: true });
    });
    return new DevToolsClient(socket);
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitForEvent(method: string) {
    return new Promise((resolve) => {
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(resolve);
      this.eventWaiters.set(method, waiters);
    });
  }

  async close() {
    this.socket.close();
  }

  private handleMessage(message: string) {
    const payload = JSON.parse(message);
    if (payload.id) {
      const pending = this.pending.get(payload.id);
      if (!pending) return;
      this.pending.delete(payload.id);
      if (payload.error) {
        pending.reject(new Error(payload.error.message ?? 'DevTools command failed'));
      } else {
        pending.resolve(payload.result);
      }
      return;
    }

    if (payload.method) {
      const waiters = this.eventWaiters.get(payload.method) ?? [];
      this.eventWaiters.delete(payload.method);
      for (const waiter of waiters) waiter(payload.params);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
