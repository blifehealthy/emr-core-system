export function listClinicalNoteTemplates(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; active?: boolean }) {
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.clinicId];

    if (input.active !== undefined) {
      params.push(input.active);
      conditions.push(`is_active = $${params.length}`);
    }

    const result = await db.query(
      `
        SELECT
          id,
          clinic_id,
          template_key,
          title,
          category,
          subjective,
          objective,
          assessment,
          plan,
          is_active,
          created_at,
          updated_at,
          deleted_at
        FROM clinical_note_templates
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY is_active DESC, title ASC
      `,
      params
    );

    return result.rows;
  };
}
