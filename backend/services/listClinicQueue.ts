import type { ClinicVisitStatus } from '../api/types.ts';

export function listClinicQueue(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    status?: ClinicVisitStatus;
    practitionerId?: string;
    limit?: number;
  }) {
    const conditions = ['cv.clinic_id = $1', 'cv.deleted_at IS NULL'];
    const params: unknown[] = [input.clinicId];

    if (input.status) {
      params.push(input.status);
      conditions.push(`cv.status = $${params.length}`);
    }

    if (input.practitionerId) {
      params.push(input.practitionerId);
      conditions.push(`cv.practitioner_id = $${params.length}`);
    }

    params.push(input.limit ?? 100);
    const limitIndex = params.length;

    const result = await db.query(
      `
        SELECT
          cv.*,
          p.medical_record_number,
          p.first_name AS patient_first_name,
          p.last_name AS patient_last_name,
          pr.first_name AS practitioner_first_name,
          pr.last_name AS practitioner_last_name
        FROM clinic_visits cv
        JOIN patients p ON p.id = cv.patient_id
        LEFT JOIN practitioners pr ON pr.id = cv.practitioner_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY cv.checked_in_at ASC, cv.created_at ASC
        LIMIT $${limitIndex}
      `,
      params
    );

    return result.rows;
  };
}
