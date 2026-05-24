import type { ClinicVisitStatus } from '../api/types.ts';

export function updateClinicVisit(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    visitId: string;
    encounterId?: string | null;
    practitionerId?: string | null;
    status?: ClinicVisitStatus;
    queueLabel?: string | null;
    roomName?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.visitId];

    if (Object.hasOwn(input, 'encounterId')) {
      params.push(input.encounterId ?? null);
      assignments.push(`encounter_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'practitionerId')) {
      params.push(input.practitionerId ?? null);
      assignments.push(`practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status);
      assignments.push(`status = $${params.length}`);
      if (input.status === 'in_room') assignments.push('called_at = COALESCE(called_at, NOW())');
      if (input.status === 'with_doctor') assignments.push('started_at = COALESCE(started_at, NOW())');
      if (input.status === 'completed') assignments.push('completed_at = COALESCE(completed_at, NOW())');
      if (input.status === 'discharged') assignments.push('discharged_at = COALESCE(discharged_at, NOW())');
    }

    if (Object.hasOwn(input, 'queueLabel')) {
      params.push(input.queueLabel ?? null);
      assignments.push(`queue_label = $${params.length}`);
    }

    if (Object.hasOwn(input, 'roomName')) {
      params.push(input.roomName ?? null);
      assignments.push(`room_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE clinic_visits
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}
