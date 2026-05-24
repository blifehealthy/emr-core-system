export function createClinicalNoteTemplate(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    templateKey: string;
    title: string;
    category?: string | null;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
    isActive?: boolean;
  }) {
    const result = await db.query(
      `
        INSERT INTO clinical_note_templates (
          clinic_id,
          template_key,
          title,
          category,
          subjective,
          objective,
          assessment,
          plan,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.clinicId,
        input.templateKey,
        input.title,
        input.category ?? null,
        input.subjective ?? null,
        input.objective ?? null,
        input.assessment ?? null,
        input.plan ?? null,
        input.isActive ?? true,
      ]
    );

    return result.rows[0];
  };
}
