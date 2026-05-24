import type { EncounterClass, EncounterStatus } from '../api/types.ts';

export function updateEncounter(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    status?: EncounterStatus;
    encounterClass?: EncounterClass;
    attendingPractitionerId?: string | null;
    chiefComplaint?: string | null;
    triageSummary?: string | null;
    startedAt?: string | null;
    endedAt?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.encounterId];

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'encounterClass')) {
      params.push(input.encounterClass ?? null);
      assignments.push(`encounter_class = $${params.length}`);
    }

    if (Object.hasOwn(input, 'attendingPractitionerId')) {
      params.push(input.attendingPractitionerId ?? null);
      assignments.push(`attending_practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'chiefComplaint')) {
      params.push(input.chiefComplaint ?? null);
      assignments.push(`chief_complaint = $${params.length}`);
    }

    if (Object.hasOwn(input, 'triageSummary')) {
      params.push(input.triageSummary ?? null);
      assignments.push(`triage_summary = $${params.length}`);
    }

    if (Object.hasOwn(input, 'startedAt')) {
      params.push(input.startedAt ?? null);
      assignments.push(`started_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'endedAt')) {
      params.push(input.endedAt ?? null);
      assignments.push(`ended_at = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE encounters
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          patient_id,
          encounter_number,
          status,
          encounter_class,
          appointment_id,
          attending_practitioner_id,
          chief_complaint,
          triage_summary,
          started_at,
          ended_at,
          created_at,
          updated_at,
          deleted_at
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}
