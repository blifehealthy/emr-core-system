import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();
const MIGRATIONS_DIR = join(ROOT_DIR, 'database', 'migrations');
const SEED_SQL = join(ROOT_DIR, 'database', 'tests', 'api_smoke_seed.sql');
const PORT = Number(process.env.API_PORT ?? '3105');
const API_TOKEN = process.env.API_TOKEN ?? 'dev-smoke-token';

const POSTGRES_CONTAINER = process.env.POSTGRES_CONTAINER ?? 'poolproject-postgres';
const POSTGRES_USER = process.env.POSTGRES_USER ?? 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? '127.0.0.1';
const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
const TEMP_DB = process.env.POSTGRES_DB ?? `emr_core_api_smoke_${randomUUID().replace(/-/g, '')}`;

const migrations = [
  '0000_organization_clinic_foundation.up.sql',
  '0001_emr_core_foundation.up.sql',
  '0002_add_organization_clinic_foreign_keys.up.sql',
  '0003_add_diagnoses_and_vital_signs.up.sql',
  '0004_add_audit_logs.up.sql',
  '0005_add_users_and_practitioners.up.sql',
  '0006_add_prescriptions.up.sql',
  '0007_add_appointments.up.sql',
].map((filename) => join(MIGRATIONS_DIR, filename));

async function main() {
  const databaseUrl = buildDatabaseUrl(TEMP_DB);
  let serverProcess: ReturnType<typeof spawn> | null = null;

  try {
    dockerExec(['createdb', '-U', POSTGRES_USER, TEMP_DB]);

    for (const migration of migrations) {
      runSqlFile(migration);
    }

    runSqlFile(SEED_SQL);

    serverProcess = spawn(
      process.execPath,
      ['--loader', 'ts-node/esm', 'scripts/start-api.ts'],
      {
        cwd: ROOT_DIR,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          API_TOKEN,
          PORT: String(PORT),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    const output: string[] = [];
    for (const stream of [serverProcess.stdout, serverProcess.stderr]) {
      stream?.on('data', (chunk) => {
        output.push(String(chunk));
      });
    }

    await waitForHealth();

    const authHeaders = {
      Authorization: `Bearer ${API_TOKEN}`,
      'x-user-id': '10000000-0000-0000-0000-000000000201',
    };

    const patientDetail = await requestJson<{
      id: string;
      encounters: Array<{
        prescriptions: Array<{ id: string }>;
      }>;
    }>(
      `/api/patients/detail?clinicId=10000000-0000-0000-0000-000000000101&medicalRecordNumber=MRN-SMOKE-001`,
      authHeaders
    );
    assert.equal(patientDetail.data.id, '10000000-0000-0000-0000-000000001001');
    assert.equal(patientDetail.data.encounters[0].prescriptions.length, 3);
    assert.equal(patientDetail.data.encounters[0].prescriptions[0].id, '10000000-0000-0000-0000-000000006003');

    const diagnoses = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/diagnoses?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=1&offset=1',
      authHeaders
    );
    assert.deepEqual(diagnoses.meta, {
      limit: 1,
      offset: 1,
      hasMore: false,
      nextOffset: null,
    });
    assert.equal(diagnoses.data.length, 1);
    assert.equal(diagnoses.data[0].id, '10000000-0000-0000-0000-000000004003');

    const vitalSigns = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/vital-signs?clinicalNoteId=10000000-0000-0000-0000-000000003001&limit=1&offset=0',
      authHeaders
    );
    assert.deepEqual(vitalSigns.meta, {
      limit: 1,
      offset: 0,
      hasMore: true,
      nextOffset: 1,
    });
    assert.equal(vitalSigns.data[0].id, '10000000-0000-0000-0000-000000005003');

    const prescriptions = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/prescriptions?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=1&offset=0',
      authHeaders
    );
    assert.deepEqual(prescriptions.meta, {
      limit: 1,
      offset: 0,
      hasMore: true,
      nextOffset: 1,
    });
    assert.equal(prescriptions.data[0].id, '10000000-0000-0000-0000-000000006003');

    const updatedDiagnosis = await requestJson<{
      id: string;
      status: string;
      resolution_note: string | null;
    }>(
      '/api/diagnoses/10000000-0000-0000-0000-000000004003',
      authHeaders,
      'PATCH',
      200,
      {
        status: 'resolved',
        resolutionNote: 'Symptoms improved',
      }
    );
    assert.equal(updatedDiagnosis.data.id, '10000000-0000-0000-0000-000000004003');
    assert.equal(updatedDiagnosis.data.status, 'resolved');
    assert.equal(updatedDiagnosis.data.resolution_note, 'Symptoms improved');

    const createdDiagnosis = await requestJson<{
      id: string;
      diagnosis_name: string;
      status: string;
      sequence_number: number | null;
    }>(
      '/api/diagnoses',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        diagnosisName: 'Allergic rhinitis',
        diagnosisType: 'working',
        status: 'active',
        sequenceNumber: 4,
      }
    );
    assert.equal(createdDiagnosis.data.diagnosis_name, 'Allergic rhinitis');
    assert.equal(createdDiagnosis.data.status, 'active');

    const updatedVitalSign = await requestJson<{
      id: string;
      heart_rate_bpm: number;
      notes: string | null;
    }>(
      '/api/vital-signs/10000000-0000-0000-0000-000000005003',
      authHeaders,
      'PATCH',
      200,
      {
        heartRateBpm: 88,
        notes: 'Heart rate settling',
      }
    );
    assert.equal(updatedVitalSign.data.id, '10000000-0000-0000-0000-000000005003');
    assert.equal(updatedVitalSign.data.heart_rate_bpm, 88);
    assert.equal(updatedVitalSign.data.notes, 'Heart rate settling');

    const createdVitalSign = await requestJson<{
      id: string;
      heart_rate_bpm: number | null;
      clinical_note_id: string | null;
    }>(
      '/api/vital-signs',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        heartRateBpm: 86,
        oxygenSaturationPct: 99,
        notes: 'Post-treatment check',
      }
    );
    assert.equal(createdVitalSign.data.heart_rate_bpm, 86);
    assert.equal(createdVitalSign.data.clinical_note_id, '10000000-0000-0000-0000-000000003001');

    const updatedSoap = await requestJson<{
      clinical_note_id: string;
      plan: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/soap',
      authHeaders,
      'PATCH',
      200,
      {
        plan: 'Rest, hydration, and follow-up',
      }
    );
    assert.equal(updatedSoap.data.clinical_note_id, '10000000-0000-0000-0000-000000003001');
    assert.equal(updatedSoap.data.plan, 'Rest, hydration, and follow-up');

    const finalizedNote = await requestJson<{
      id: string;
      status: string;
      finalized_at: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/finalize',
      authHeaders,
      'PATCH',
      200,
      {}
    );
    assert.equal(finalizedNote.data.id, '10000000-0000-0000-0000-000000003001');
    assert.equal(finalizedNote.data.status, 'final');
    assert.ok(finalizedNote.data.finalized_at);

    const signedNote = await requestJson<{
      id: string;
      status: string;
      signed_at: string | null;
      authored_by_practitioner_id: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/sign',
      authHeaders,
      'PATCH',
      200,
      {}
    );
    assert.equal(signedNote.data.id, '10000000-0000-0000-0000-000000003001');
    assert.equal(signedNote.data.status, 'final');
    assert.ok(signedNote.data.signed_at);
    assert.equal(signedNote.data.authored_by_practitioner_id, '10000000-0000-0000-0000-000000000301');

    const createdPrescription = await requestJson<{
      id: string;
      medication_name: string;
      status: string;
    }>(
      '/api/prescriptions',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        medicationName: 'Cetirizine',
        dosage: '10 mg',
        route: 'oral',
        frequency: 'daily',
        durationText: '7 days',
        instructions: 'after dinner',
        status: 'active',
        startDate: '2026-01-04',
        endDate: '2026-01-10',
      }
    );
    assert.equal(createdPrescription.data.medication_name, 'Cetirizine');
    assert.equal(createdPrescription.data.status, 'active');

    const updatedPrescription = await requestJson<{
      id: string;
      status: string;
      instructions: string | null;
    }>(
      `/api/prescriptions/${createdPrescription.data.id}`,
      authHeaders,
      'PATCH',
      200,
      {
        status: 'completed',
        instructions: 'completed course',
      }
    );
    assert.equal(updatedPrescription.data.id, createdPrescription.data.id);
    assert.equal(updatedPrescription.data.status, 'completed');
    assert.equal(updatedPrescription.data.instructions, 'completed course');

    const deletedPrescription = await requestJson<{
      id: string;
      deleted_at: string | null;
    }>(
      `/api/prescriptions/${createdPrescription.data.id}`,
      authHeaders,
      'DELETE',
      200
    );
    assert.equal(deletedPrescription.data.id, createdPrescription.data.id);
    assert.ok(deletedPrescription.data.deleted_at);

    const diagnosesAfterCreate = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/diagnoses?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=10&offset=0',
      authHeaders
    );
    assert.deepEqual(
      diagnosesAfterCreate.data.map((item) => item.id),
      [
        '10000000-0000-0000-0000-000000004001',
        createdDiagnosis.data.id,
      ]
    );

    const vitalSignsAfterCreate = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/vital-signs?clinicalNoteId=10000000-0000-0000-0000-000000003001&limit=10&offset=0',
      authHeaders
    );
    assert.equal(vitalSignsAfterCreate.data[0].id, createdVitalSign.data.id);

    const prescriptionsAfterDelete = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/prescriptions?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=10&offset=0',
      authHeaders
    );
    assert.deepEqual(
      prescriptionsAfterDelete.data.map((item) => item.id),
      [
        '10000000-0000-0000-0000-000000006003',
        '10000000-0000-0000-0000-000000006001',
      ]
    );

    console.log('API smoke test passed');
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await onceExit(serverProcess);
    }

    try {
      dockerExec(['dropdb', '-U', POSTGRES_USER, TEMP_DB]);
    } catch (error) {
      console.error(`failed to drop temp db ${TEMP_DB}:`, error);
    }
  }
}

function buildDatabaseUrl(databaseName: string) {
  return `postgres://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(
    POSTGRES_PASSWORD
  )}@${POSTGRES_HOST}:${POSTGRES_PORT}/${databaseName}`;
}

function dockerExec(args: string[], input?: string) {
  const result = spawnSync('docker', ['exec', ...(input ? ['-i'] : []), POSTGRES_CONTAINER!, ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    input,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `docker exec failed: ${args.join(' ')}`);
  }
}

function runSqlFile(filename: string) {
  dockerExec(
    ['psql', '-v', 'ON_ERROR_STOP=1', '-U', POSTGRES_USER, '-d', TEMP_DB],
    readFileSync(filename, 'utf8')
  );
}

async function waitForHealth() {
  const deadline = Date.now() + 20_000;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const response = await httpJson<{ status: string }>('/health');
      if (response.statusCode === 200 && response.body.status === 'ok') {
        return;
      }
      lastError = new Error(`health check returned ${response.statusCode}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw lastError ?? new Error('health check timed out');
}

async function requestJson<TData>(
  path: string,
  headers: Record<string, string>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  expectedStatus = 200,
  requestBody?: unknown
) {
  const response = await httpJson<TData>(path, headers, method, requestBody);
  const responseBody = response.body;
  assert.equal(response.statusCode, expectedStatus, JSON.stringify(responseBody));
  return responseBody as {
    data: TData;
    meta?: { limit: number; offset: number; hasMore: boolean; nextOffset: number | null };
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onceExit(child: ReturnType<typeof spawn>) {
  return new Promise<void>((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }

    child.once('exit', () => resolve());
  });
}

function httpJson<TData>(
  path: string,
  headers: Record<string, string> = {},
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
) {
  return new Promise<{ statusCode: number; body: TData }>((resolve, reject) => {
    const rawBody = body === undefined ? undefined : JSON.stringify(body);
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          ...headers,
          ...(rawBody
            ? {
                'content-type': 'application/json',
                'content-length': String(Buffer.byteLength(rawBody)),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const body = rawBody.length > 0 ? (JSON.parse(rawBody) as TData) : ({} as TData);

            resolve({
              statusCode: res.statusCode ?? 0,
              body,
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    if (rawBody) {
      req.write(rawBody);
    }
    req.end();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
